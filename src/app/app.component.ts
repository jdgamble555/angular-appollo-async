import { Component } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-apollo-async';

  tasks!: Observable<any>;

  error: any;

  GET_TODOS = gql`
  query {
    queryTask {
      id
      title
      completed
      user {
        username
      }
    }
  }
`;

  constructor(
    private apollo: Apollo,
  ) {
    this.getTasks();
  }

  getTasks() {
    this.tasks = this.apollo
      .subscribe({
        query: this.GET_TODOS,
      })
      .pipe(
        map((result: any) => {
          console.log(result.data);
          const r = result.data['queryTask'];
          console.log(r);
          if (result.error) {
            this.error = result.errors;
          }
          return r;
        })
      );
  }

}
