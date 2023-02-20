import { PokemonType } from "./pokemon_type";


export interface DamageRelations {
  double_damage_from?: PokemonType[],
  double_damage_to?: PokemonType [],
  half_damage_from?:PokemonType [],
  half_damage_to?:PokemonType [],
  no_damage_from?:PokemonType [],
  no_damage_to?:PokemonType []

}
