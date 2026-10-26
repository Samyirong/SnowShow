// Run from any directory: node scripts/check-galleries.cjs
// Check displayed galleries, not retired image assets kept for old links/posters.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const context = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(root, "assets/js/resorts.js"), "utf8"),
  context,
);
const resorts = context.window.SNOW_RESORTS;
const groups = context.window.SNOW_SHARED_GALLERIES || [];
const albums = [...resorts, ...groups];
const ownerByHash = new Map();
let count = 0;
for (const album of albums) {
  if (album.photos?.length)
    assert(
      album.photos.length >= 6,
      `${album.name}: at least 6 selected photos required`,
    );
  for (const photo of album.photos || []) {
    assert(
      Number.isInteger(photo.year) && album.years.includes(photo.year),
      `${album.name}: unverified photo year`,
    );
    assert(
      !path.isAbsolute(photo.src) && !photo.src.split("/").includes(".."),
      "Photo must be a site-relative asset",
    );
    const bytes = fs.readFileSync(path.join(root, photo.src));
    const hash = crypto.createHash("sha256").update(bytes).digest("hex");
    assert(
      !ownerByHash.has(hash),
      `Duplicate photo across galleries: ${album.name} / ${ownerByHash.get(hash)}`,
    );
    ownerByHash.set(hash, album.name);
    count++;
  }
  if (album.sharedGalleryId) {
    const group = groups.find((g) => g.id === album.sharedGalleryId);
    assert(
      group?.memberIds.includes(album.id),
      "Broken connected-area gallery reference",
    );
    assert.equal(
      album.photos.length,
      0,
      "Unlocated shared photos must not be assigned to an individual resort",
    );
    assert.equal(
      album.videos.length,
      0,
      "Shared films belong to the canonical connected-area album",
    );
  }
}
for (const group of groups) {
  assert(
    group.classificationNote?.includes("無法逐張"),
    "Connected-area albums must explain location uncertainty",
  );
  assert(
    group.memberIds.length >= 2,
    "Connected-area albums require resort membership",
  );
  for (const id of group.memberIds)
    assert.equal(resorts.find((r) => r.id === id)?.sharedGalleryId, group.id);
}
console.log(
  JSON.stringify({
    result: "PASS",
    resorts: resorts.length,
    galleries: albums.filter((a) => a.photos?.length).length,
    photos: count,
    crossGalleryDuplicatePhotos: 0,
    connectedAreaGalleries: groups.length,
  }),
);
