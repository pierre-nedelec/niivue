const { snapshot, httpServerAddress, seconds } = require("./helpers");
const path = require("path");
const fs = require("fs");

const downloadPath = path.resolve('./downloads');
const fileName = "test.nii";

function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

beforeEach(async () => {

  await page.goto(httpServerAddress, { timeout: 0 });
  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath,
  });
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
});
test("saveImage", async () => {
  let downloadLink = await page.evaluate(async () => {
    let nv = new niivue.Niivue();
    await nv.attachTo("gl", false);
    // load one volume object in an array
    var volumeList = [
      {
        url: "./images/mni152.nii.gz", //"./RAS.nii.gz", "./spm152.nii.gz",
        volume: { hdr: null, img: null },
        name: "mni152.nii.gz",
        colorMap: "gray",
        opacity: 1,
        visible: true,
      },
    ];
    await nv.loadVolumes(volumeList);
    nv.saveImage("test.nii");
    
    return;
  });
    
  // wait until we navigate or the test will not wait for the downloaded file
  await page.goto(httpServerAddress, {waitUntil: 'networkidle2'});
  const fileSize = getFilesizeInBytes(path.join(downloadPath, fileName));
  expect(fileSize).toBeGreaterThan(4336029);


});

