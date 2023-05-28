<template>
  <div>
    <ul class="flex flex-col gap-2">
      <li>* {{ $t('disclaimer') }}</li>
      <li>
        <span>* {{ $t('otherServices') }}:</span>
        <a href="https://buryat-lang.ru/" class="text-blue-500" target="_blank">
          Burlang.Toli
        </a>
        <span>и</span>
        <a
          href="https://uulen.gazeta-n1.ru/"
          class="text-blue-500"
          target="_blank"
        >
          Үүлэн
        </a>
      </li>
    </ul>

    <div class="mt-3 flex flex-col gap-3">
      <p>
        {{ $t('chromeExtension') }}
      </p>

      <p>
        {{ $t('keyboardLayouts') }}
        <a
          href="https://github.com/buryads/buryad-keyboard-layout"
          class="cursor-pointer text-blue-500"
          target="_blank"
        >
          GitHub
        </a>
      </p>

      <p>
        {{ $t('supportOurProject') }}
        {{ $t('on') }}
        <a
          href="https://boosty.to/buryads"
          class="cursor-pointer text-blue-500"
          target="_blank"
        >
          Boosty
        </a>
        {{ $t('or') }}
        <a
          href="https://www.patreon.com/buryads"
          class="cursor-pointer text-blue-500"
          target="_blank"
        >
          Patreon
        </a>
      </p>
    </div>

    <div class="mt-5 justify-center gap-4 md:flex">
      <a
        href="https://play.google.com/store/apps/details?id=com.buryads.orshuulga_mobile"
        target="_blank"
      >
        <img
          src="/images/apple-appstore-badge.svg"
          class="h-10"
          alt="Play Store"
        />
      </a>
      <a
        href="https://apps.apple.com/ru/app/%D0%B1%D1%83%D1%80%D1%8F%D1%82%D1%81%D0%BA%D0%BE-%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-%D1%81%D0%BB%D0%BE%D0%B2%D0%B0%D1%80%D1%8C/id1584232985"
        target="_blank"
      >
        <img
          src="/images/google-playstore-badge.svg"
          class="h-10"
          alt="App Store"
        />
      </a>
      <a
        href="https://chrome.google.com/webstore/detail/%D0%B1%D1%83%D1%80%D1%8F%D1%82%D1%81%D0%BA%D0%BE-%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-%D1%81%D0%BB%D0%BE%D0%B2%D0%B0%D1%80%D1%8C/gmljjdkoihndbbddpmechgpmacpglcei?hl=ru"
        target="_blank"
      >
        <img src="/images/chrome-web-store.png" class="h-10" alt="App Store" />
      </a>
    </div>
  </div>
</template>
