/**
 * MOCK DATA — used only when NEXT_PUBLIC_CORPUS_MOCK=1 and the real API is
 * unavailable. Delete this file (and the import in corpus.ts) once the backend
 * is live.
 */
import type {
  CorpusSearchParams,
  CorpusSearchResponse,
  CorpusReleasesResponse,
} from './corpus-types';

const MOCK_HITS: CorpusSearchResponse['hits'] = [
  {
    id: 'mock-mono-1',
    text_bxr: 'Буряад хэлэн — монгол хэлэнэй бүлэгтэ ородог хэлэн юм.',
    text_ru: null,
    type: 'mono',
    source: 'monocorpus',
    license: 'CC BY 4.0',
    attribution: {
      name: 'Leipzig Corpora Collection',
      url: 'https://corpora.uni-leipzig.de/',
    },
  },
  {
    id: 'mock-parallel-1',
    text_bxr: 'Үдэр бүри буряад хэлэ hуража байгаа hаа, та хурдан дүршэлтэй болохот.',
    text_ru: 'Если учить бурятский каждый день, вы быстро станете опытным.',
    type: 'parallel',
    source: 'sarana_parallel',
    license: 'CC BY-SA 4.0',
    attribution: {
      name: 'Sarana Parallel Corpus',
      url: 'https://sarana.buryads.com/',
    },
    highlight: {
      text_bxr: ['буряад <em>хэлэ</em>'],
      text_ru: ['бурятский'],
    },
  },
  {
    id: 'mock-lexicon-1',
    text_bxr: 'нохой',
    text_ru: 'собака',
    type: 'lexicon',
    source: 'uniparser_lexicon',
    license: 'CC BY 4.0',
    attribution: {
      name: 'UniParser Buryat Lexicon',
      url: 'https://github.com/timarkh/uniparser-grammar-buryat',
    },
  },
  {
    id: 'mock-toponym-1',
    text_bxr: 'Байгал далай',
    text_ru: 'Озеро Байкал',
    type: 'toponym',
    source: 'osm_toponyms_bxr',
    license: 'ODbL',
    attribution: {
      name: 'OpenStreetMap',
      url: 'https://www.openstreetmap.org/',
    },
  },
  {
    id: 'mock-mono-2',
    text_bxr: 'Нара гаража, шарай байгаали гэрэлтэбэ.',
    text_ru: null,
    type: 'mono',
    source: 'wiki_sentences',
    license: 'CC BY-SA 3.0',
    attribution: {
      name: 'Buryat Wikipedia',
      url: 'https://bxr.wikipedia.org/',
    },
  },
  {
    id: 'mock-parallel-2',
    text_bxr: 'Хүн бүхэн нэрэтэй, нютагтай, угтай.',
    text_ru: 'У каждого человека есть имя, родина и род.',
    type: 'parallel',
    source: 'lingtrain_parallel',
    license: 'MIT',
    attribution: {
      name: 'LingTrain Parallel Corpus',
      url: 'https://github.com/lingtrain',
    },
  },
];

export function getMockSearchResponse(params: CorpusSearchParams): CorpusSearchResponse {
  let hits = [...MOCK_HITS];

  if (params.type && params.type.length > 0) {
    hits = hits.filter((h) => params.type!.includes(h.type));
  }
  if (params.has_translation) {
    hits = hits.filter((h) => h.text_ru !== null);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    hits = hits.filter(
      (h) =>
        h.text_bxr.toLowerCase().includes(q) ||
        (h.text_ru ?? '').toLowerCase().includes(q),
    );
  }

  const page = params.page ?? 1;
  const perPage = params.per_page ?? 20;
  const start = (page - 1) * perPage;
  const paged = hits.slice(start, start + perPage);

  return {
    total: hits.length,
    page,
    per_page: perPage,
    facets: {
      type: { mono: 2, parallel: 2, lexicon: 1, toponym: 1 },
      source: {
        monocorpus: 1,
        sarana_parallel: 1,
        uniparser_lexicon: 1,
        osm_toponyms_bxr: 1,
        wiki_sentences: 1,
        lingtrain_parallel: 1,
      },
      license: {
        'CC BY 4.0': 2,
        'CC BY-SA 4.0': 1,
        'CC BY-SA 3.0': 1,
        ODbL: 1,
        MIT: 1,
      },
    },
    hits: paged,
  };
}

export const MOCK_RELEASES_RESPONSE: CorpusReleasesResponse = {
  latest: {
    version: '0.1.0-mock',
    date: '2026-07-01T00:00:00Z',
    size_bytes: 312_000_000,
    record_count: 707_000,
    checksum: 'sha256:mockchecksumdeadbeef0000000000000000000000000000000000000000',
    formats: {
      jsonl_gz: {
        url: '/corpus/download',
        size_bytes: 312_000_000,
      },
      csv_gz: {
        url: '/corpus/download?format=csv',
        size_bytes: 480_000_000,
      },
    },
    manifest_url: '/corpus/manifest.json',
    readme_url: '/corpus/README.md',
    license_url: '/corpus/LICENSE',
  },
};
