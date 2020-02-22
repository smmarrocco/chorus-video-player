import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { DataService } from "../services/data.service";
import { ActivatedRoute } from "@angular/router";

import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

@Component({
  selector: "app-video-player",
  templateUrl: "./video-player.component.html",
  styleUrls: ["./video-player.component.scss"]
})
export class VideoPlayerComponent implements OnInit {
  @ViewChild("videoPlayer") videoPlayer: ElementRef;

  videoUrl$: Observable<any>;

  isPlaying: boolean = false;

  constructor(
    private dataService: DataService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    /**
     * retrieve the id param from the url and use switchMap to pass it
     * to the data Service when avaiable. pipe async is used in temaplate
     */
    this.videoUrl$ = this.activeRoute.queryParamMap.pipe(
      switchMap(params => {
        return this.dataService.video(params.get("id"));
      })
    );
  }
  /**
   * toggles video playback and sets isPlaying to respected value
   * isPlaying is used to hide/show the play button
   */
  toggleVideo() {
    this.isPlaying = this.videoPlayer.nativeElement.paused;
    this.isPlaying
      ? this.videoPlayer.nativeElement.play()
      : this.videoPlayer.nativeElement.pause();
  }
}
