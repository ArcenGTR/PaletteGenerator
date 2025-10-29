import { Component, inject, DestroyRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { PaletteService } from '../../services/palette/palette.service';
import { UserService } from '../../services/user/user.service';
import { KeycloakService } from '../../services/keycloak/keycloak.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, map, startWith, switchMap } from 'rxjs';
import { User } from '../../models/user.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SomDisplayComponent } from "../reusable/som-display/som-display.component";
import { PaletteDisplayComponent } from "../reusable/palette-display/palette-display.component";
import { HierarchicalHistoryComponent } from "../reusable/hierarchical-history/hierarchical-history.component";
import { trigger, state, style, transition, animate } from '@angular/animations';



@Component({
  selector: 'app-published-palettes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzRadioModule,
    NzSelectModule,
    NzInputModule,
    NzInputNumberModule,
    NzSliderModule,
    NzSegmentedModule,
    NzPaginationModule,
    NzSpinModule,
    NzModalModule
],
  templateUrl: './published-palettes.component.html',
  styleUrls: ['./published-palettes.component.scss'],
  animations: [
    trigger('fadeSlide', [
      state('closed', style({ height: '0', opacity: 0, transform: 'translateY(-10px)', margin: 0 })),
      state('open', style({ height: '*', opacity: 1, transform: 'translateY(0)', marginTop: '1rem' })),
      transition('closed => open', [animate('300ms ease-out')]),
      transition('open => closed', [animate('200ms ease-in')])
    ])
  ]
})
export class PublishedPalettesComponent {
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  paletteService = inject(PaletteService);
  userService = inject(UserService);
  keycloakService = inject(KeycloakService);
  destroyRef = inject(DestroyRef);

  @ViewChild('observer', { static: false }) observerElement!: ElementRef<HTMLDivElement>;
  isLoadingMore = false;

  currentView$ = new BehaviorSubject<'all' | 'voted' | 'my-palettes'>('all');
  views = [
    { label: 'All Palettes', value: 'all' },
    { label: 'Voted', value: 'voted' },
    { label: 'My Palettes', value: 'my-palettes' }
  ];

  user: User | null = null;
  private refresh$ = new BehaviorSubject<void>(undefined);
  displayCount$ = new BehaviorSubject(9);

  selectedPalette$ = new BehaviorSubject<any | null>(null);

  filters$ = new BehaviorSubject({
    filterMethods: [] as string[],
    kMeansFilterColorCountRange: [1, 16] as number[],
    hierarchicalFilterColorCountRange: [1, 16] as number[],
    filterSomWidth: [4, 30] as number[] | null,
    filterSomHeight: [4, 30] as number[] | null,
    filterUsername: '' as string
  });


  private allPalettes$ = combineLatest([
    this.currentView$, 
    this.refresh$
  ]).pipe(
    switchMap(([currentView, _]) => {
      switch (currentView) {
        case 'all':
          return this.paletteService.getPublishedPalettes();
        case 'voted':
          return this.paletteService.getUserVotedPalettes();
        case 'my-palettes':
          return this.paletteService.getUserSavedPalettes();
        default:
          return [];
      }
    }),
    startWith([])
  );

  filteredPalettes$ = combineLatest([
    this.allPalettes$,
    this.filters$,
    this.currentView$,
    this.displayCount$
  ]).pipe(
    map(([palettes, filters, currentView, displayCount]) =>
      this.applyFilters(palettes, filters, currentView).slice(0, displayCount)
    )
  );

  ngOnInit(): void {
    if (this.keycloakService.isLoggedIn()) {
      this.loadUserInfo();
    } else {
      this.views = [{ label: 'All Palettes', value: 'all' }];
    }
  }

  ngAfterViewInit(): void {
    const element = this.observerElement?.nativeElement;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting && !this.isLoadingMore) {
          this.isLoadingMore = true;
          this.loadMore();

          setTimeout(() => {
            this.isLoadingMore = false;
          }, 800);
        }
      },
      { threshold: 1.0, rootMargin: '100px 0px' }
    );

    this.filteredPalettes$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(palettes => {
        if (palettes.length > 0) {
          //console.log(palettes.length);
          observer.observe(element);
        }
      });
  }

  loadMore() {
    this.displayCount$.next(this.displayCount$.value + 9);
  }

  private applyFilters(palettes: any[], f: any, currentView: string): any[] {
    return palettes.filter(p => {
      if (f.filterMethods.length && !f.filterMethods.includes(p.method)) return false;

      if (p.method === 'kmeans') {
        const count = p.palette?.length ?? 0;
        if (count < f.kMeansFilterColorCountRange[0] || count > f.kMeansFilterColorCountRange[1]) return false;
      }

      if (p.method === 'hierarchical') {
        const count = p.mergeHistory?.length ?? 0;
        if (count < f.hierarchicalFilterColorCountRange[0] || count > f.hierarchicalFilterColorCountRange[1]) return false;
      }

      if (p.method === 'som') {
        const width = p.kohonenMap?.[0]?.length ?? 0;
        const height = p.kohonenMap?.length ?? 0;

        if (width < f.filterSomWidth[0] || width > f.filterSomWidth[1]) return false;
        if (height < f.filterSomHeight[0] || height > f.filterSomHeight[1]) return false;
      }

      if (f.filterUsername && !p.user?.toLowerCase().includes(f.filterUsername.toLowerCase())) return false;

      return true;
    });
  }

  updateFilter(partial: Partial<typeof this.filters$.value>) {
    this.filters$.next({ ...this.filters$.value, ...partial });
  }

  isPaletteInUserVotes(paletteId: string): boolean {
    if (!this.user || !this.user.voted) return false;
    return this.user.voted.includes(paletteId);
  }

  onVote(paletteId: string): void {
    if (!this.user) { 
      this.message.warning('Please log in to vote for palettes.'); 
      return; 
    }


    this.paletteService.votePalette(paletteId).subscribe({
      next: () => {
        this.refresh$.next();
        this.user!.voted.push(paletteId);
      },
      error: err => console.error('Error voting for palette:', err)
    });
  }

  onUnvote(paletteId: string): void {
    if (!this.user) return;
    this.user.voted = this.user.voted.filter(id => id !== paletteId);
    this.paletteService.unvotePalette(paletteId).subscribe({
      next: () => {
        this.refresh$.next();
      },
      error: err => console.error('Error unvoting for palette:', err)
    });
  }

  onPublish(paletteId: string): void {
    this.paletteService.publishPalette(paletteId).subscribe({
      next: () => {
        this.message.success('Palette published successfully!');
        this.refresh$.next();
      },
      error: err => {
        console.error('Error publishing palette:', err);
        this.message.error('Failed to publish palette.');
      }
    });
  }

  onPaletteSaved(): void { // просто сообщение пока без логики
    this.message.info('Palette saved (stub).');
  }

  onPalettePublished(): void { // просто сообщение пока без логики
    this.message.success('Palette published (stub).');
  }

  closeDetails(): void {
    this.selectedPalette$.next(null);
  }

  openPaletteDetails(item: any): void {
    let component: any;
    const params: any = {
      paletteItem: item,
      paletteSaved: () => this.onPaletteSaved(),
      palettePublished: () => this.onPalettePublished()
    };

    switch (item.method) {
      case 'kmeans':
        component = PaletteDisplayComponent;
        break;

      case 'som':
        component = SomDisplayComponent;
        params.mapWidth = 12;
        params.mapHeight = 12;
        params.kohonenMap = item.kohonenMap;
        break;

      case 'hierarchical':
        component = HierarchicalHistoryComponent;
        params.palette = item.mergeHistory;
        break;

      default:
        return;
    }

    const modalRef = this.modal.create({
      nzTitle: `Palette details — ${item.method.toUpperCase()}`,
      nzContent: component,
      nzData: params,
      nzWidth: '80%',
      nzCentered: true,
      nzFooter: null,
      nzBodyStyle: { padding: '24px', background: '#fff' },
      nzClosable: true
    });

    modalRef.afterClose.subscribe(() => {
      //console.log('Modal closed');
    });
  }

  confirmDeletePalette(paletteId: string): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this palette?',
      nzContent: 'This action cannot be undone.',
      nzOkText: 'Delete',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Cancel',
      nzOnOk: () => this.deletePalette(paletteId)
    });
  }

  private deletePalette(paletteId: string): void {
    this.paletteService.deletePalette(paletteId).subscribe({
      next: () => {
        this.message.success('Palette deleted successfully.');
        this.refresh$.next();
      },
      error: (err) => {
        console.error('Error deleting palette:', err);
        this.message.error('Failed to delete palette.');
      }
    });
  }



  getKMeansFlatColors(palette: number[][]): string[] {
    if (!palette) return [];
    return palette.map(c => `rgb(${c[0]},${c[1]},${c[2]})`);
  }

  getHierarchicalFlatColors(mergeHistory: number[][][]): string[] {
    if (!mergeHistory) return [];
    return mergeHistory.map(graph => {
      const first = graph[0];
      return `rgb(${first[0]},${first[1]},${first[2]})`;
    });
  }

  private loadUserInfo(): void {
    this.userService
      .getCurrentUserInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: user => (this.user = user),
        error: err => console.error('Error fetching user info:', err)
      });
  }

}
