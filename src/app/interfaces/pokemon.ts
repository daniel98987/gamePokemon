import { Sprites } from './sprites';
import { Stats } from './stats';
import { Types } from './types';
import { Damage } from './damage';
import { DamageObject } from './damageObject';
export interface Pokemon {
  id: string,
  name: string,
  sprites:  Sprites ,
  stats: Stats[],
  types:Types,
  sound:string,
  damage_relation: Damage[],
  damage_relationObject:DamageObject,
  damage_relationOverPokemonEnemy:Damage[],

}
