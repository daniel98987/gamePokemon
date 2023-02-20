import { Damage } from './damage';

export interface DamageObject {
  double_damage_from:Damage,
  double_damage_to:Damage,
  half_damage_from:Damage,
  half_damage_to:Damage,
  no_damage_from:Damage
  no_damage_to:Damage
}
