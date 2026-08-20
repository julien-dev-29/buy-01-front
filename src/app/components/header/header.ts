import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatToolbar, MatToolbarModule } from "@angular/material/toolbar";
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-header',
    templateUrl: './header.html',
    styleUrl: './header.css',
    imports: [MatToolbarModule, MatIconModule, MatButtonModule, RouterLink]
})
export class HeaderComponent {

}