import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { VideoPlayerComponent } from "./video-player/video-player.component";

const routes: Routes = [
  {
    path: "",
    component: VideoPlayerComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
