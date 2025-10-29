import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthComponent } from './components/auth/auth.component';
import { AuthGuard } from './guards/auth.guard';
import { PublishedPalettesComponent } from './components/published-palettes/published-palettes.component';
import { Title } from '@angular/platform-browser';

export const routes: Routes = [
    { path: 'home', component: HomeComponent, data: { title: 'Home' } },
    { path: "auth", component: AuthComponent, data: { title: 'Auth' } },
    { path: 'published-palettes', component: PublishedPalettesComponent, data: { title: 'Published Palettes' } },
    { path: '**', redirectTo: 'home' }
];
