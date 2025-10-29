import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  SimpleChanges,
  inject,
  EventEmitter,
  Output,
  AfterViewInit,
  OnChanges,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import * as d3 from 'd3';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { GraphLink, GraphNode } from '../../../models/graph-internal.model';
import { PaletteItem } from '../../../models/palette-item.model';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { PaletteService } from '../../../services/palette/palette.service';
import { KeycloakService } from '../../../services/keycloak/keycloak.service';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-hierarchical-history',
  standalone: true,
  imports: [CommonModule,
            NzRadioModule,
            FormsModule,
            NzButtonModule,
            NzIconModule,
            NzToolTipModule
          ],
  templateUrl: './hierarchical-history.component.html',
  styleUrl: './hierarchical-history.component.scss'
})

export class HierarchicalHistoryComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('graphContainer', { static: true }) container!: ElementRef;

  private componentWidth: number = 720;
  private componentHeight: number = 576;

  @Input() paletteItem: PaletteItem | null = null;
  @Input() palette: number[][][] = [];
  @Output() paletteSaved = new EventEmitter<void>();
  @Output() palettePublished = new EventEmitter<void>();

  imageUrl: string | ArrayBuffer | null | undefined = null;

  nodes: GraphNode[] = [];
  links: GraphLink[] = [];

  currentFormat: 'rgb' | 'hex' | 'hsl' = 'rgb';

  private message = inject(NzMessageService);
  private paletteService = inject(PaletteService);
  public keycloakService = inject(KeycloakService);

  modalRef = inject(NzModalRef, { optional: true });
  modalData = inject(NZ_MODAL_DATA, { optional: true });  

  ngOnInit(): void {
    if (this.modalData) {
      this.paletteItem = this.modalData.paletteItem ?? null;
      this.palette = this.modalData.palette ?? [];
      this.imageUrl = this.paletteItem?.imageUrl || null;
    }
  }

 

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paletteItem']) {
      this.imageUrl = this.paletteItem?.imageUrl || null;
    }

    if (this.container?.nativeElement && (changes['palette'] || changes['paletteItem'])) {
        this.processPalette();
        this.createGraph();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.palette?.length) {
        this.processPalette();
        this.createGraph();
      } else {
        console.warn('⚠️ No palette data yet (nzData or @Input are empty)');
      }
    }, 200);
  }



  private createGraph() {
    d3.select(this.container.nativeElement).selectAll('*').remove();

    const containerEl = this.container.nativeElement;
    this.componentWidth = containerEl.clientWidth || 720;
    this.componentHeight = containerEl.clientHeight || 576;

    if (this.componentWidth === 0 || this.componentHeight === 0 || this.nodes.length === 0) {
      return;
    }

    const svg = d3.select(containerEl)
      .append('svg')
      .attr('width', this.componentWidth)
      .attr('height', this.componentHeight);

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.06, 3])
      .extent([[0, 0], [this.componentWidth, this.componentHeight]])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const initialScale = 0.5;

    const translateX = (this.componentWidth / 2) * (1 - initialScale);
    const translateY = (this.componentHeight / 2) * (1 - initialScale);

    const initialTransform = d3.zoomIdentity
        .translate(translateX, translateY)
        .scale(initialScale);


    svg.transition().duration(0).call(zoom.transform, initialTransform);

    const simulation = d3.forceSimulation<GraphNode>(this.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(this.links).id(d => d.id));

    const link = g.selectAll('line')
      .data(this.links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2);

    const copyToClipboard = (colorValue: string) => {
      const el = document.createElement('textarea');
      el.value = colorValue;
      document.body.appendChild(el);
      el.select();

      try {
          document.execCommand('copy');
          this.message.success(`Color "${colorValue}" copied to clipboard!`);
      } catch (err) {
          this.message.error('Failed to copy color to clipboard.');
      }
      document.body.removeChild(el);
    };

    const node = g.selectAll('circle')
      .data(this.nodes)
      .enter()
      .append('circle')
      .attr('r', d => d.r || 10)
      .attr('fill', d => `rgb(${d.color[0]}, ${d.color[1]}, ${d.color[2]})`)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        const color = this.formatColor(d.color[0], d.color[1], d.color[2], this.currentFormat);
        copyToClipboard(color);
      })
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on('start', (event: any, d: GraphNode) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();

            d.fx = d.x;
            d.fy = d.y;

        })
        .on('drag', (event: any, d: GraphNode) => {
            d.fx = event.x;
            d.fy = event.y;
        })
        .on('end', (event: any, d: GraphNode) => {
            if (!event.active) simulation.alphaTarget(0);
        }));



    const labels = g.selectAll('text')
      .data(this.nodes)
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('fill', 'white')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      labels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });

   

    const controlSize = 30;
    const controls = svg.append('g')
      .attr('transform', `translate(${this.componentWidth - controlSize * 2 - 20}, 20)`)
      .attr('class', 'zoom-controls');

    controls.append('rect')
      .attr('x', 0).attr('y', 0).attr('width', controlSize).attr('height', controlSize)
      .attr('fill', '#f0f0f0').attr('stroke', '#999').style('cursor', 'pointer')
      .on('dblclick', (event) => event.stopPropagation())
      .on('click', () => zoom.scaleBy(svg.transition().duration(300), 1.2));

    controls.append('text')
      .attr('x', controlSize / 2).attr('y', controlSize / 2 + 5).attr('text-anchor', 'middle')
      .attr('fill', '#333').text('+').style('pointer-events', 'none');

    controls.append('rect')
      .attr('x', 0).attr('y', controlSize + 5).attr('width', controlSize).attr('height', controlSize)
      .attr('fill', '#f0f0f0').attr('stroke', '#999').style('cursor', 'pointer')
      .on('dblclick', (event) => event.stopPropagation())
      .on('click', () => zoom.scaleBy(svg.transition().duration(300), 0.8));

    controls.append('text')
      .attr('x', controlSize / 2).attr('y', controlSize + 5 + controlSize / 2 + 5).attr('text-anchor', 'middle')
      .attr('fill', '#333').text('-').style('pointer-events', 'none');


    controls.append('rect')
      .attr('x', 0).attr('y', 2 * (controlSize + 5)).attr('width', controlSize).attr('height', controlSize)
      .attr('fill', '#f0f0f0').attr('stroke', '#999').style('cursor', 'pointer')
      .on('dblclick', (event) => event.stopPropagation())
      .on('click', () => {
        svg.transition().duration(500).call(zoom.transform, initialTransform);
      });

    controls.append('text')
      .attr('x', controlSize / 2).attr('y', 2 * (controlSize + 5) + controlSize / 2 + 5).attr('text-anchor', 'middle')
      .attr('fill', '#333').text('⟳').style('pointer-events', 'none');

    this.updateTooltips();
  }

  private processPalette() {
    if (!this.palette || this.palette.length === 0) {
      this.nodes = [];
      this.links = [];

      return;
    }

    this.nodes = [];
    this.links = [];

    for (let i = 0; i < this.palette.length; i++) {
      let visited = new Set<number>();
      this.dfsLinkColorNodes(this.palette[i], i, visited, 0);
    }
  }

  get isModalView(): boolean {
    return !!this.modalData;
  }

  private dfsLinkColorNodes(hierarchy: number[][], subTreeIndex: number, visited: Set<number>, index: number) {

    if (visited.has(index) || index >= hierarchy.length) return;

    visited.add(index);

    this.dfsLinkColorNodes(hierarchy, subTreeIndex, visited, 2 * index + 1);
    this.dfsLinkColorNodes(hierarchy, subTreeIndex, visited, 2 * index + 2);

    const coords = this.calculateColorCoords(subTreeIndex, index, 100);

    this.nodes.push({
      id: `${subTreeIndex}-${index}`,
      color: hierarchy[index] || [128, 128, 128],
      x: coords.x,
      y: coords.y,
      fx: coords.x,
      fy: coords.y,
      r: coords.r
    });

    if (2 * index + 1 < hierarchy.length) {
      this.links.push({
        source: `${subTreeIndex}-${index}`,
        target: `${subTreeIndex}-${2 * index + 1}`
      });

    }

    if (2 * index + 2 < hierarchy.length) {
      this.links.push({
        source: `${subTreeIndex}-${index}`,
        target: `${subTreeIndex}-${2 * index + 2}`
      });
    }
  }



  private calculateColorCoords(subTreeIndex: number, index: number, r: number): { x: number, y: number , r: number } {
    const totalSectors = this.palette.length;
    const level = Math.floor(Math.log2(index + 1));
    const levelIndex = index - (2 ** level - 1);
    const radius = (level + 1) * r;
    const sectorStart = (2 * Math.PI / totalSectors) * subTreeIndex;
    const sectorEnd = (2 * Math.PI / totalSectors) * (subTreeIndex + 1);
    const nodesInLevel = 2 ** level;
    const angleInSector = sectorEnd - sectorStart;
    const angle = sectorStart + (levelIndex + 0.5) * (angleInSector / nodesInLevel);

    const centerX = this.componentWidth / 2;
    const centerY = this.componentHeight / 2;

    const baseRadius = 20;
    const size = baseRadius * Math.pow(0.82, level);

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return { x, y, r: size };
  }

  onFormatChange() {
    this.updateTooltips();
  }

  private updateTooltips() {
    const that = this;

    d3.select(this.container.nativeElement).selectAll('circle')
      .select('title')
      .remove();

    d3.select(this.container.nativeElement).selectAll('circle')
      .each(function(this: any, d: any) {

        const node = d as GraphNode;
        const color = that.formatColor(node.color[0], node.color[1], node.color[2], that.currentFormat);

        d3.select(this)
          .append('title')
          .text(`Click to copy: ${color}`);
      });
  }



  savePalette(): void {
    if (this.palette.length === 0) {
      this.message.warning('There is no palette to save.');
      return;

    }

    this.paletteService.savePalette(this.paletteItem?.paletteId).subscribe({
      next: () => {
        this.message.success('Palette saved successfully!');
        this.paletteSaved.emit();
      },
      error: (error) => {
        console.error('Save failed:', error);
        this.message.error('Failed to save palette. Please try again.');
      }
    });
  }



  publishPalette(): void {
    if (this.palette.length === 0) {
      this.message.warning('There is no palette to publish.');

      return;
    }

    this.paletteService.publishPalette(this.paletteItem?.paletteId).subscribe({
      next: () => {
        this.message.success('Palette published successfully!');
        this.palettePublished.emit();
      },
      error: (error) => {
        console.error('Publish failed:', error);
        this.message.error('Failed to publish palette. Please try again.');
      }
    });
  }



  private formatColor(r: number, g: number, b: number, format: string): string {
    switch (format) {
      case 'hex':
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      case 'rgb':
        return `rgb(${r}, ${g}, ${b})`;
      case 'hsl': {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
      }
      default: return '';
    }
  }



  close() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}