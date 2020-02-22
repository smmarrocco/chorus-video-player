import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class DataService {
  private ENDPOINT = environment.apiUrl;

  constructor(private http: HttpClient) {}
  /**
   * Gets the video location from the endpoint
   * @param id id of video file
   * @returns Observable<string> complete string of file location
   *
   */
  video(id: string): Observable<string> {
    return of(`${this.ENDPOINT}${id}.mp4`);
  }

  /**
   * Gets the transcript from the endpoint
   * @param id id of videos coorsponding transcript
   * @returns json values of the transcript ({snippet, speaker, time})
   */
  transcript(id: string): Observable<any> {
    return this.http.get(`${this.ENDPOINT}${id}.json`);
  }
}
