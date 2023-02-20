import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../../app-routing.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../import/angular-material.module';
import {  routesPokemon } from './pokemon-routing.module';
import { BattlePokemonComponent } from './battle/battle-pokemon.component';





@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routesPokemon),
    FormsModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  declarations: [BattlePokemonComponent]
})
export class PokemonModule { }
