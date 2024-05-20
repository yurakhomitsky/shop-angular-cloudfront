import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class ManageProductsService extends ApiService {
  uploadProductsCSV(file: File): Observable<unknown> {
    return this.getPreSignedUrl(file.name).pipe(
      switchMap((url) =>
        this.http.put(url, file, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'text/csv',
            'x-ms-blob-type': 'BlockBlob',
          },
        }),
      ),
    );
  }

  private getPreSignedUrl(fileName: string): Observable<string> {
    const url = this.getUrl('import', 'import');

    return this.http
      .get<{ sasToken: string; sasUrl: string; url: string }>(url, {
        params: {
          name: fileName,
        },
      })
      .pipe(map((response) => response.sasUrl));
  }
}
