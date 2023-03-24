import { Injectable } from '@angular/core';

export declare interface MiahootUser{
  readonly name: string;
  readonly photoURL : string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }
}
