import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Auth, authState, signInAnonymously, signOut, User, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { async, BehaviorSubject, EMPTY, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { traceUntilFirst } from '@angular/fire/performance';
import { AsyncPipe } from '@angular/common';
import { FirebaseApp, firebaseApp$ } from '@angular/fire/app';
import { doc, Firestore, getDoc, setDoc } from '@firebase/firestore';
import { MiahootUser } from './data.service';
import { docData } from '@angular/fire/firestore';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  template: `
    
  `,
  styles: []
})
export class AppComponent {
  title = 'Miahoot';
  private readonly userDisposable: Subscription|undefined;
  public readonly user: Observable<User | null> = EMPTY;
  bsIsAuth = new BehaviorSubject<boolean>(false);
  showLoginButton = false;
  showLogoutButton = false;
  fireStore = new Firestore;
  constructor(@Optional() private auth: Auth, private router:Router) {
    authState(auth).subscribe( 
      async U =>{
        if (U != null){
          const docId = "User/${U.uid}"
          const docUser = doc()
          const snapUser = await getDoc(docUser)
          if (!snapUser.exists()){
            setDoc(
              docUser,{
                name: U.displayName??U.email??U.uid,
                photoURL:U.photoURL??"efkdsfmskdf.fr",
              }satisfies MiahootUser
              )
          }
        }
      }
     )
     authState(auth).pipe(
      switchApp=>(U =>{
        if(U==null){
          return of (undefined)
        }else{
          const docId = "User/${U.uid}"
          const docUser = doc(Firestore,docId).withConverter()
          return docData(docUser)
        }
      })
     )
    if (auth) {
      this.user = authState(this.auth);
      this.userDisposable = authState(this.auth).pipe(
        traceUntilFirst('auth'),
        map(u => !!u)
      ).subscribe(isLoggedIn => {
        this.showLoginButton = !isLoggedIn;
        this.showLogoutButton = isLoggedIn;
      });
    }
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    if (this.userDisposable) {
      this.userDisposable.unsubscribe();
    }
  }

  async login() {
    this.bsIsAuth.next(true);
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    try{
      await signInWithPopup(this.auth, googleProvider);
    }catch(err){
      console.error("erreur de login")
    }
    this.bsIsAuth.next(false);
    return await signInWithPopup(this.auth, new GoogleAuthProvider());
  }


  async logout() {
    return await signOut(this.auth);
  }
  
  toAccountConfig(){
    this.router.navigateByUrl("accountConfig")
  }

 
}
