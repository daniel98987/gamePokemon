

import { Routes } from '@angular/router';
import { BattlePokemonComponent } from './battle/battle-pokemon.component';


export const routesPokemon: Routes = [
  {
    path: '',
    children: [

      {
        path: '',
        component:BattlePokemonComponent
      },

    ]
  }
];

