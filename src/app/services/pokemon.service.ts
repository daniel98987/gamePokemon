import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of, Observable, forkJoin } from 'rxjs';
import { Pokemon } from '../interfaces/pokemon';
import { log } from 'console';
import { AlertService } from './alert.service';


@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2';
  constructor(protected http: HttpClient, public alert: AlertService) { };
  
  public getPokemonData(id: number) {
    return this.http.get(`${this.apiUrl}/pokemon/${id}`).pipe(catchError(error => {
      console.error(error);
      return of(error);
    })
    );;
  }
  public getPokemonList(limit: number): Observable<any> {

    const params = new HttpParams()
      .set('limit', limit.toString())
    return this.http.get(`${this.apiUrl}/pokemon`, { params: params }).pipe(
      switchMap((data: any) => {
        let requests: Observable<any>[] = [];
        data.results.forEach((pokemon: any) => {
          requests.push(this.getPokemonDetails(pokemon.url, pokemon.name));
        });
        return forkJoin(requests);
      })
    )
  }

  public getPokemonDetails(pokemonUrl: string, name: string): Observable<any> {
    return this.http.get(`${pokemonUrl}`).pipe(
      map((data: any) => {
        data.sound = `https://play.pokemonshowdown.com/audio/cries/${name}.mp3`
        return data;
      })
    );
  }
  public getPokemonsType(): Observable<any> {
    return this.http.get(`${this.apiUrl}/type`).pipe(
      switchMap((data: any) => {
        let requests: Observable<any>[] = [];
        data.results.forEach((pokemonType: any) => {
          requests.push(this.getPokemonsTypeDetails(pokemonType.url));
        });
        return forkJoin(requests);



      })
    );
  }
  public getPokemonsTypeDetails(url: string): Observable<any> {
    return this.http.get(url).pipe(
      switchMap((data: any) => {
        data.url = url;
        return of(data);
      })

    );
  }
  public getFirstPokemonsByType(limit: number, type: string): Observable<any> {
    const params = new HttpParams()
      .set('limit', limit.toString())
    return this.http.get(`${this.apiUrl}/type/${type}`, { params: params }).pipe(
      switchMap((data: any) => {
        let requests: Observable<any>[] = [];
        if (data.pokemon && data.pokemon.length > 0) {
          data.pokemon.forEach((pokemon: any) => {
            requests.push(this.getPokemonDetails(pokemon.pokemon.url, pokemon.pokemon.name));
          });
          return forkJoin(requests);
        } else {
          return of([]);
        }


      })
    )
  }




}
