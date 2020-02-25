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
  trasncript$ = new BehaviorSubject<{ speaker?: string; snippets?: any }>(
    undefined
  );

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

  /**
   * uses the video player time to determine when the utterence should be
   * displayed
   * @param videoTime time of the video player
   */
  private updateTranscript(videoTime: number) {
    this.transcripts.forEach((transcript, index) => {
      if (
        index < this.transcripts.length - 1 &&
        transcript.time <= videoTime &&
        this.transcripts[index + 1].time >= videoTime
      ) {
        this.addTranscript(transcript.speaker, transcript.snippet);
      }
    });
  }

  /**
   * Adds the speaker and snippet value to the Subject that is used
   * to display the current speaker and snippet
   * @param speaker string value of the speaker
   * @param snippet string value of the snippet (utterence)
   */
  private addTranscript(speaker: string, snippet: string) {
    let snippets: string[] = [];
    // check if subject already has values
    if (this.trasncript$.getValue()) {
      const transcript = this.trasncript$.getValue();
      // get only unique values from existing transcript$
      snippets = Array.from(new Set(transcript.snippets));
      // prevent adding duplicate values buy checking if snippet param exists
      if (!snippets.find(item => item === snippet)) {
        snippets.push(snippet);
      }
      // for now, to only show one speaker at a time
      // clear the array when a new speaker is speaking
      if (transcript.speaker !== speaker) {
        snippets = [];
      }
      // keep the UI clean by only allowing 3 utturences displayed at a time
      if (snippets.length > 3) {
        snippets.splice(3, snippets.length - 1);
      }
    }
    // set the value of the BehaviourSubject for template
    this.trasncript$.next({
      speaker: speaker,
      snippets: snippets
    });
  }
  /**
   * Used to get the current time of the video player
   * @param value the event emitted by video timeupdate
   */
  onTimeUpdate(value) {
    this.updateTranscript(value.target.currentTime);
  }
}
