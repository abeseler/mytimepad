/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "fonts/MaterialIcons-Regular.ttf",
    "revision": "a37b0c01c0baf1888ca812cc0508f6e2"
  },
  {
    "url": "fonts/MaterialIcons-Regular.woff",
    "revision": "012cf6a10129e2275d79d6adac7f3b02"
  },
  {
    "url": "fonts/MaterialIcons-Regular.woff2",
    "revision": "570eb83859dc23dd0eec423a49e147fe"
  },
  {
    "url": "img/google.svg",
    "revision": "752536d8059d2a92ec94472b9b6de366"
  },
  {
    "url": "img/icon-128.png",
    "revision": "36cd169611f0217e054ddadd789c85d2"
  },
  {
    "url": "img/icon-192.png",
    "revision": "f72da1e25316e9d71e918809ae4e86d8"
  },
  {
    "url": "img/icon-32.png",
    "revision": "84e0cc59eb0bc8df187ddee92d49e50e"
  },
  {
    "url": "img/icon-48.png",
    "revision": "344eb56ff031d53933691d39c795aa47"
  },
  {
    "url": "img/icon-512.png",
    "revision": "7e42d9a4e4a701594eb2da66e297c050"
  },
  {
    "url": "img/icon-72.png",
    "revision": "a928bb3e839e764dc32189b48df50f56"
  },
  {
    "url": "manifest.json",
    "revision": "f09143ba4a2ad8241742df2fd9082800"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
