import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { PokemonService } from '../../../services/pokemon.service';
import { AlertService } from '../../../services/alert.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Msg } from '../msg'
import { MatTableDataSource } from '@angular/material/table';
import { Pokemon } from 'src/app/interfaces/pokemon';
import { TypePokemonDetails } from '../../../interfaces/type_pokemon_details';
import { DamageObject } from '../../../interfaces/damageObject';
import { Damage } from 'src/app/interfaces/damage';
import { ObjectWin } from '../../../interfaces/objectWin';
@Component({
  selector: 'app-mapa-pokemon',
  templateUrl: './battle-pokemon.component.html',
  styleUrls: ['./battle-pokemon.component.css']
})
export class BattlePokemonComponent implements OnInit {
  private maxPokemon: number = 151;
  public msgOnView: any = Msg;
  public lstPokemones: Pokemon[] | null;
  public lstPokemones2: Pokemon[] | null;
  public lstPokemonesFilter: Pokemon[] | null | undefined;
  public lstPokemonesFilter2: Pokemon[] | null | undefined;
  public pokemonsTypes: TypePokemonDetails[];
  public selectFirstPokemon: Pokemon | any;
  public selectSecondPokemon: Pokemon | any;
  public pokemonMouseOver: Pokemon | any;
  public pokemonInfo: Pokemon | any;
  public searchTerm: string;
  private infoPokemonRef: MatDialogRef<any, any>;
  public imageShow: string;
  public figth: boolean = false;
  public resultFigth: boolean = false;
  public resultsViewInformation: boolean = false;
  public dataSourcePokemon = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['information', 'description'];
  public displayedResults: string[] = ['name', 'type', "puntuation"];
  public audioInterval: any;
  public objectDamage: Damage[] | null;
  public objectResultFigth: ObjectWin | null;
  public audio = new Audio();
  @ViewChild('progressBar', { static: true }) progressBar: ElementRef;
  @ViewChild('infoPokemon', { static: true }) infoPokemon: TemplateRef<any>;

  constructor(private pokemonCrud: PokemonService, private alertService: AlertService, private nodeDialog: MatDialog) { }
  ngOnInit(): void {
    this.loadInitData();
  }
  public loadInitData() {
    //Cargar primeros 151 pokemones
    this.pokemonCrud.getPokemonList(this.maxPokemon).subscribe(resp => {
      this.divideArrayOfPokemons(resp.length, resp);
    });
    //Cargar tipos de pokemones
    this.pokemonCrud.getPokemonsType().subscribe(resp => {
      this.pokemonsTypes = resp;

    })

  }
  public divideArrayOfPokemons(length: number, resp: any) {
    const half = Math.ceil(length / 2);
    this.lstPokemones = resp.slice(0, half); // Primera mitad
    this.lstPokemones2 = resp.slice(half); // Segunda mitad
    this.lstPokemonesFilter = this.lstPokemones;
    this.lstPokemonesFilter2 = this.lstPokemones2;
  }
  public loadDamageRelationPokemon(pokemon: any) {
    pokemon.damage_relation = this.formatObjectDamagerelation();
    for (let index = 0; index < pokemon.types.length; index++) {
      const element = pokemon.types[index];
      const searchTypePokemon = this.pokemonsTypes.find((type: any) => element.type.name == type.name);

      if (searchTypePokemon) {
        pokemon.damage_relation[0].array = this.filterDamage(pokemon.damage_relation[0].array, searchTypePokemon.damage_relations.double_damage_from)
        pokemon.damage_relation[1].array = this.filterDamage(pokemon.damage_relation[1].array, searchTypePokemon.damage_relations.double_damage_to)
        pokemon.damage_relation[2].array = this.filterDamage(pokemon.damage_relation[2].array, searchTypePokemon.damage_relations.half_damage_from)
        pokemon.damage_relation[3].array = this.filterDamage(pokemon.damage_relation[3].array, searchTypePokemon.damage_relations.half_damage_to)
        pokemon.damage_relation[4].array = this.filterDamage(pokemon.damage_relation[4].array, searchTypePokemon.damage_relations.no_damage_from)
        pokemon.damage_relation[5].array = this.filterDamage(pokemon.damage_relation[5].array, searchTypePokemon.damage_relations.no_damage_to)
      }
    }
    return pokemon;
  }
  public filterDamage(damage_relation: any[], damagaRelationOfType: any) {
    if (damage_relation.length == 0) {
      damage_relation = [];
      damage_relation = damagaRelationOfType
    }
    else {
      for (let i = 0; i < damagaRelationOfType.length; i++) {
        const element = damagaRelationOfType[i];
        const existing = damage_relation.find((d: any) => d.name === element.name);
        if (!existing) {
          damage_relation.push(element);
        }
      }
    }
    return damage_relation;

  }

  public getDescriptionDamage(description: string): string {
    return this.msgOnView.INFORMATIO_POKEMON[description];
  }

  public arrayPuntuation(arrayFirst: any, arraySecond: any) {
    var pokemonTypesFirstArray = arrayFirst.types.map((obj: any) => {
      delete obj.slot;
      return obj.type;
    });

    var pokemonTypesSecondArray = arraySecond.types.map((obj: any) => {
      delete obj.slot;
      return obj.type
    });


    var damage_relationObjectFirst = arrayFirst.damage_relationObject;
    var damage_relationObjectSecond = arraySecond.damage_relationObject;

    var arrayCointain: any = [];
    var giveDamage = true;
    var reciveDamage = false;

    if (damage_relationObjectFirst.no_damage_to && damage_relationObjectFirst.no_damage_to.array.length > 0) {
      damage_relationObjectFirst.no_damage_to.array.forEach((element: any) => {
        var found = pokemonTypesSecondArray.includes((p: any) => p == element)
        if (!found) {
          giveDamage = false;
        }
      });
    }

    if (giveDamage && damage_relationObjectFirst.no_damage_to.array.length > 0) {
      if (damage_relationObjectFirst.no_damage_to && damage_relationObjectFirst.no_damage_to.array.length > 0) {
        arrayCointain.push(damage_relationObjectFirst.no_damage_to);
      }
    } else {
      if (damage_relationObjectFirst.double_damage_to && damage_relationObjectFirst.double_damage_to.array.length > 0) {
        const halfDamageTo = damage_relationObjectFirst.double_damage_to.array.find((elem: any) => pokemonTypesSecondArray.some((type: any) => type.name == elem.name))
        if (halfDamageTo) {
          arrayCointain.push(damage_relationObjectFirst.double_damage_to);
        }

      }
      if (damage_relationObjectFirst.half_damage_to && damage_relationObjectFirst.half_damage_to.array.length > 0) {
        const halfDamageTo = damage_relationObjectFirst.half_damage_to.array.find((elem: any) => pokemonTypesSecondArray.some((type: any) => type.name == elem.name));
        if (halfDamageTo) {
          arrayCointain.push(damage_relationObjectFirst.half_damage_to);
        }
      }

    }

    ///Recibir daño
    if (pokemonTypesFirstArray.no_damage_from && pokemonTypesFirstArray.no_damage_from.array.length > 0) {
      pokemonTypesSecondArray.forEach((type: any) => {
        damage_relationObjectSecond.no_damage_from.array.forEach((typeFirst: any) => {
          if (typeFirst.name !== type.name) {
            reciveDamage = true;
            return;
          }
        });
      });
    }

    if (reciveDamage &&  pokemonTypesFirstArray.no_damage_from.array.length > 0) {
      if (damage_relationObjectSecond.half_damage_from.length > 0) {
        arrayCointain.push(damage_relationObjectSecond.half_damage_from);

      }
    } else {

      if (damage_relationObjectFirst.double_damage_from.array.length > 0) {
        const halfDamageTo = damage_relationObjectFirst.double_damage_from.array.find((elem: any) => pokemonTypesSecondArray.some((type: any) => type.name == elem.name));
        if (halfDamageTo) {
          arrayCointain.push(damage_relationObjectFirst.double_damage_from);
        }

      }
      if (damage_relationObjectFirst.half_damage_from.array.length > 0) {
        const halfDamageTo = damage_relationObjectFirst.half_damage_from.array.find((elem: any) => pokemonTypesSecondArray.some((type: any) => type.name == elem.name));
        if (halfDamageTo) {
          arrayCointain.push(damage_relationObjectFirst.half_damage_from);
        }

      }


    }

    return arrayCointain;
  }

  public winnerPokemon(arrayDamageFirst: any, arrayDamageSecond: any) {
    var accumulate: ObjectWin = {
      accumulateFirstPokemon: 0,
      accumulateSecond: 0,
      ganador: -1,
    }
    if (arrayDamageFirst.length > 0) {
      arrayDamageFirst.forEach((element: any) => {
        accumulate.accumulateFirstPokemon += element.value;
      });
    };
    if (arrayDamageSecond.length > 0) {
      arrayDamageSecond.forEach((element: any) => {
        accumulate.accumulateSecond += element.value;
      });
    };
    if (accumulate.accumulateFirstPokemon > accumulate.accumulateSecond) {
      accumulate.ganador = 0;
    } else if (accumulate.accumulateSecond > accumulate.accumulateFirstPokemon) {
      accumulate.ganador = 1;
    } else {
      accumulate.ganador = 2;
    }

    return accumulate;
  }
  public cleanGame() {
    this.selectFirstPokemon = null;
    this.selectSecondPokemon = null;
    this.objectResultFigth = null;
    this.objectDamage = null;
    this.figth = false;
    this.resultFigth = false;
    this.pokemonMouseOver = null;
    this.pokemonInfo = null;
    this.resultsViewInformation = false
    this.audioInterval = null;
  }
  public figthValidation() {
    this.selectFirstPokemon.damage_relationObject = this.formatTypeArrayDamage(this.selectFirstPokemon.damage_relation);
    this.selectSecondPokemon.damage_relationObject = this.formatTypeArrayDamage(this.selectSecondPokemon.damage_relation);
    this.selectFirstPokemon.damage_relationOverPokemonEnemy = this.arrayPuntuation(this.selectFirstPokemon, this.selectSecondPokemon);
    this.selectSecondPokemon.damage_relationOverPokemonEnemy = this.arrayPuntuation(this.selectSecondPokemon, this.selectFirstPokemon);
    this.objectResultFigth = this.winnerPokemon(this.selectFirstPokemon.damage_relationOverPokemonEnemy, this.selectSecondPokemon.damage_relationOverPokemonEnemy);
    this.figth = false;
    this.resultFigth = true;
    this.playAudioNoSelect();
    this.playAudioNoSelect(this.msgOnView.SONG.endFigth);
  }

  public selectPokemon(pokemon: any) {
    var okSounds = this.validationOverSounds(pokemon);
    if (okSounds) {
      this.playAudioNoSelect(this.msgOnView.SONG.select);
    }
    if (!this.selectFirstPokemon) {
      this.selectFirstPokemon = this.loadDamageRelationPokemon(pokemon);

    }
    if (!this.selectSecondPokemon && this.selectFirstPokemon && this.selectFirstPokemon.id !== pokemon.id) {

      this.selectSecondPokemon = this.loadDamageRelationPokemon(pokemon);;
      this.playAudioNoSelect(this.msgOnView.SONG.figth);
      this.figth = true;

    }
  }


  public onSelectPokemon(event: any) {
    this.pokemonCrud.getFirstPokemonsByType(this.maxPokemon, event.value).subscribe(resp => {
      if (resp && resp.length > 0) {
        this.cleanPokemons();
        this.divideArrayOfPokemons(resp.length, resp);
      } else {
        this.alertService.warning("WARNING", `No existen pokemones de tipo ${event.value}`)
      }
    })

  }
  public arrayObjectPokemon() {

  }

  public cleanPokemons() {
    this.lstPokemones = null; // Primera mitad
    this.lstPokemones2 = null; // Segunda mitad
    this.selectFirstPokemon = null;
    this.selectSecondPokemon = null;
  }



  public validationOverSounds(pokemon: any) {
    return (this.selectFirstPokemon && this.selectFirstPokemon.id == pokemon.id
      || this.selectSecondPokemon && this.selectSecondPokemon.id == pokemon.id
      || this.selectSecondPokemon && this.selectSecondPokemon) ? false : true;
  }
  public validateMouseenter(pokemon: any) {
    this.pokemonMouseOver = pokemon;
    var okSounds = this.validationOverSounds(pokemon);
    if (okSounds) {
      this.playAudioNoSelect(this.msgOnView.SONG.moveSelect)
    }


  }
  public playAudioNoSelect(nombreArchivo?: string) {
    if (nombreArchivo) {

      this.audio.volume = 1;
      if (nombreArchivo == this.msgOnView.SONG.select) {
        this.audio.volume = 0.2;
      }

      this.audio.src = `assets/audios/${nombreArchivo}`;
      this.audio.load();
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }
  public getStyle(pokemon: any) {

    if (this.selectFirstPokemon && this.selectFirstPokemon.id == pokemon.id) {
      return ['style-select-first-pokemon', 'image-border'];
    } else if (this.selectSecondPokemon && this.selectSecondPokemon.id == pokemon.id) {
      return ['style-select-seconds-pokemon', 'image-border'];
    }
    else if (this.selectFirstPokemon && this.selectSecondPokemon && this.selectFirstPokemon.id !== pokemon.id && this.selectSecondPokemon.id !== pokemon.id) {
      return ['image-both-pokemons-select'];
    }
    else if (this.pokemonMouseOver && this.pokemonMouseOver.id == pokemon.id) {
      return ['effect-without-select', 'image-border'];
    } else {
      return ['image-border'];
    }


  }
  public getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  public sortData(pokemon: any) {
    this.dataSourcePokemon.data = [];
    for (let index = 0; index < pokemon.stats.length; index++) {
      var element = pokemon.stats[index];
      element.color = this.getRandomColor();
      this.dataSourcePokemon.data.push(element)
    }
  }

  public openDialogPokemon(pokemon?: any, view?: number) {
    if (view == 0) {
      this.resultsViewInformation = false;
      this.imageShow = pokemon.sprites && pokemon.sprites.front_default ? pokemon.sprites.front_default : this.msgOnView.URL_POKE_APP.nothing_pokemon;
      this.sortData(pokemon)
      if (pokemon.sound) {
        var audio = new Audio(`${pokemon.sound}`);
        audio.load();
        audio.play();
      }
      this.pokemonInfo = this.loadDamageRelationPokemon(pokemon);
      this.infoPokemonRef = this.nodeDialog.open(this.infoPokemon, {
        disableClose: true,
        maxWidth: '25%',
        maxHeight: '80%',
        panelClass: 'col-md-6',
      });
      this.infoPokemonRef.addPanelClass(['col-sm-12', 'col-md-8']);
    } else {
      this.resultsViewInformation = true;
      this.objectDamage = this.formatObjectDamagerelation();

      this.infoPokemonRef = this.nodeDialog.open(this.infoPokemon, {
        disableClose: true,
        maxWidth: '60%',
        maxHeight: '80%',
        panelClass: 'col-md-6',
      });
      this.infoPokemonRef.addPanelClass(['col-sm-12', 'col-md-8']);
    }



  }
  public cerrarInfoPokemon() {
    this.infoPokemonRef.close();
  }
  public onSearch(searchTerm: any) {
    this.lstPokemonesFilter = this.lstPokemones?.filter(pokemon => pokemon.name.toLowerCase().startsWith(searchTerm.toLowerCase()));
    this.lstPokemonesFilter2 = this.lstPokemones2?.filter(pokemon => pokemon.name.toLowerCase().startsWith(searchTerm.toLowerCase()));
  }
  public formatTypeArrayDamage(array: any) {
    var objectDamage: DamageObject = {
      "double_damage_from": array[0],
      "double_damage_to": array[1],
      "half_damage_from": array[2],
      "half_damage_to": array[3],
      "no_damage_from": array[4],
      "no_damage_to": array[5]
    }
    return objectDamage;
  }
  public formatObjectDamagerelation() {
    var objectDamage: Damage[] = [
      { name: 'double_damage_from', value: -70, array: [] },
      { name: 'double_damage_to', value: 70, array: [] },
      { name: 'half_damage_from', value: -30, array: [] },
      { name: 'half_damage_to', value: 30, array: [] },
      { name: 'no_damage_from', value: 0, array: [] },
      { name: 'no_damage_to', value: 0, array: [] },
    ];
    return objectDamage;
  }
}
