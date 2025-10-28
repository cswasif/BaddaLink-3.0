import { FileTransfer, setStreamSaverMitm } from 'secure-file-transfer'

import { trackerUrls } from 'config/trackerUrls'
import { streamSaverUrl } from 'config/streamSaverUrl'

setStreamSaverMitm(streamSaverUrl)

export class FileTransferService {
  fileTransfer: FileTransfer
  private optimizedTrackerUrls: string[] | undefined

  constructor(rtcConfig: RTCConfiguration, optimizedTrackerUrls?: string[]) {
    this.optimizedTrackerUrls = optimizedTrackerUrls || trackerUrls
    this.fileTransfer = new FileTransfer({
      torrentOpts: {
        announce: this.optimizedTrackerUrls,
      },
      webtorrentInstanceOpts: {
        tracker: {
          rtcConfig,
        },
      },
    })
  }

  /**
   * Update tracker URLs with optimized ones
   */
  updateTrackerUrls(optimizedTrackerUrls: string[]): void {
    this.optimizedTrackerUrls = optimizedTrackerUrls
    // Note: WebTorrent instance would need to be recreated to use new trackers
    // This is a limitation of the current implementation
  }

  /**
   * Get current tracker URLs being used
   */
  getCurrentTrackerUrls(): string[] | undefined {
    return this.optimizedTrackerUrls
  }
}
