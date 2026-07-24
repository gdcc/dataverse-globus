export interface TransferData {
  load: boolean;
  userAccessTokenData: any;
  basicClientToken: string;
  datasetDirectory: string;
  globusEndpoint: string;
  datasetPid: string;
  datasetVersion: string;
  datasetId: string;
  key: string;
  siteUrl: string;
  files: any;
  fileMetadataId: string;
  storePrefix: string;
  signedUrls: any;
  managed: boolean;
  referenceEndpointsWithPaths: Array<string>;
}
