import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { DataService } from "../services/data.service";
import { ActivatedRoute } from "@angular/router";

import { Observable, forkJoin, BehaviorSubject, throwError } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import { Transcript } from "../models/transcript.model";

@Component({
  selector: "app-video-player",
  templateUrl: "./video-player.component.html",
  styleUrls: ["./video-player.component.scss"]
})
export class VideoPlayerComponent implements OnInit {
  @ViewChild("videoPlayer") videoPlayer: ElementRef;

  transcripts: Transcript[];
  trasncript$ = new BehaviorSubject<Transcript>(undefined);

  // variables for video player
  isPlaying: boolean = false;
  videoContent$: Observable<any>;

  constructor(
    private dataService: DataService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.videoContent$ = this.initalize();
  }

  /**
   * retrieve the id param from the url and use switchMap to pass it
   * to the data Service when avaiable. pipe async is used in temaplate
   * @returns Observable of video
   */
  initalize(): Observable<any> {
    return this.activeRoute.queryParamMap.pipe(
      switchMap(params => {
        const id = params.get("id");
        // if there is no id provided throw an Error
        // this will trigger the else in the template and got o #broken
        if (!id) {
          throwError("ERROR --> No ID Provided");
        }
        return forkJoin([
          this.dataService.video(id),
          this.dataService.transcript(id)
        ]).pipe(
          map(([video, transcript]) => {
            // sort the transcript results by time
            // and use the initalizers async pipe in the template
            // to assign this to the local transcript variable
            this.transcripts = transcript.sort(
              (a, b) => parseFloat(a.time) - parseFloat(b.time)
            );
            return {
              video: video
            };
          })
        );
      })
    );
  }

  /**
   * toggles video playback and sets isPlaying to respected value
   * isPlaying is used to hide/show the play button
   *
   */
  toggleVideo() {
    this.isPlaying =
      this.videoPlayer.nativeElement.paused ||
      this.videoPlayer.nativeElement.ended;
    this.isPlaying
      ? this.videoPlayer.nativeElement.play()
      : this.videoPlayer.nativeElement.pause();
  }

  onTimeUpdate(value) {
    const currentVideoTime = value.target.currentTime;
    let speaker: Transcript;

    // loop through entire transcript array to determine if the transcript time is less than currentTime
    // TODO this is expensive as it will loop through the entire array everytime the time updates
    this.transcripts.forEach(transcript => {
      if (transcript.time <= currentVideoTime) {
        speaker = transcript;
      }
    });

    this.trasncript$.next(speaker);
  }
}
