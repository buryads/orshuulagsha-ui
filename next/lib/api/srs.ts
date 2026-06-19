// TODO(8794): свериться с финальным контрактом backend-tl (борд API-CONTRACTS)
// Временный контракт: GET /api/srs/due, POST /api/srs/grade
import { apiCall } from './client';
import type { SrsCard, SrsDueResponse, SrsGrade } from '@/lib/api/types';

const RESOURCE_DUE = '/api/srs/due';
const RESOURCE_GRADE = '/api/srs/grade';

interface SrsDueApiResponse {
  data: SrsCardDto[];
  meta: { count: number };
}

// TODO(8794): DTO-форма ответа бэка — уточнить при публикации контракта
interface SrsCardDto {
  id: string;
  word: string;
  translation: string;
  ipa?: string;
  audio_url?: string;
  image_url?: string;
  example_bur?: string;
  example_ru?: string;
}

function mapCardDto(dto: SrsCardDto): SrsCard {
  return {
    id: dto.id,
    word: dto.word,
    translation: dto.translation,
    ipa: dto.ipa,
    audioUrl: dto.audio_url,
    imageUrl: dto.image_url,
    exampleBur: dto.example_bur,
    exampleRu: dto.example_ru,
  };
}

export async function getDueCards(): Promise<SrsDueResponse> {
  const body = await apiCall<SrsDueApiResponse>('GET', RESOURCE_DUE);
  return {
    cards: body.data.map(mapCardDto),
    count: body.meta.count,
  };
}

export async function gradeCard(cardId: string, grade: SrsGrade): Promise<void> {
  await apiCall<void>('POST', RESOURCE_GRADE, {
    data: { cardId, grade },
  });
}
