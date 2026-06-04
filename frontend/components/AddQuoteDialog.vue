<script setup lang="ts">
import { Plus, Check } from "lucide-vue-next";
import type { Book } from "~/types";

const props = defineProps<{ books: Book[]; presetBookId?: number }>();
const emit = defineEmits<{ (e: "created"): void; (e: "book-created"): void }>();

const open = defineModel<boolean>("open", { default: false });
const api = useApi();
const toast = useToast();

const content = ref("");
const memo = ref("");
const page = ref<string>("");
const tagsRaw = ref("");
const bookId = ref<number | null>(null);
const newBookMode = ref(false);
const newTitle = ref("");
const newAuthor = ref("");
const saving = ref(false);

watch(open, (v) => {
  if (v) {
    content.value = "";
    memo.value = "";
    page.value = "";
    tagsRaw.value = "";
    newBookMode.value = props.books.length === 0;
    newTitle.value = "";
    newAuthor.value = "";
    bookId.value =
      props.presetBookId ?? (props.books.length ? props.books[0].id : null);
  }
});

const canSave = computed(() => {
  if (!content.value.trim()) return false;
  if (newBookMode.value) return !!newTitle.value.trim();
  return !!bookId.value;
});

async function save() {
  if (!canSave.value || saving.value) return;
  saving.value = true;
  try {
    let targetBookId = bookId.value;
    if (newBookMode.value) {
      const book = await api.createBook({
        title: newTitle.value.trim(),
        author: newAuthor.value.trim(),
      });
      targetBookId = book.id;
      emit("book-created");
    }
    const tags = tagsRaw.value
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    await api.createQuote({
      book_id: targetBookId!,
      content: content.value.trim(),
      page: page.value ? Number(page.value) : null,
      memo: memo.value.trim(),
      tags,
    });
    toast.success("문장을 수집했어요");
    open.value = false;
    emit("created");
  } catch (e) {
    toast.error("저장에 실패했어요");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UiDialog
    v-model:open="open"
    title="문장 수집"
    description="마음에 닿은 문장을 적어보세요"
  >
    <div class="space-y-4">
      <!-- 문장 -->
      <div class="space-y-1.5">
        <label class="text-[13px] font-semibold text-foreground/80">문장</label>
        <UiTextarea
          v-model="content"
          placeholder="책에서 만난 좋은 문장을 입력하세요"
          class="min-h-28"
        />
      </div>

      <!-- 책 선택 -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="text-[13px] font-semibold text-foreground/80">책</label>
          <button
            v-if="books.length"
            class="text-[13px] font-medium text-primary hover:underline"
            @click="newBookMode = !newBookMode"
          >
            {{ newBookMode ? "기존 책 선택" : "새 책 추가" }}
          </button>
        </div>

        <div v-if="!newBookMode">
          <div class="relative">
            <select
              v-model="bookId"
              class="h-11 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-sm focus-visible:outline-none focus-visible:border-foreground/25 focus-visible:ring-2 focus-visible:ring-foreground/[0.05]"
            >
              <option v-for="b in books" :key="b.id" :value="b.id">
                {{ b.title }}{{ b.author ? ` · ${b.author}` : "" }}
              </option>
            </select>
            <span
              class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >▾</span
            >
          </div>
        </div>

        <div v-else class="space-y-2">
          <UiInput v-model="newTitle" placeholder="책 제목" />
          <UiInput v-model="newAuthor" placeholder="저자 (선택)" />
        </div>
      </div>

      <!-- 페이지 + 태그 -->
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <label class="text-[13px] font-semibold text-foreground/80"
            >페이지</label
          >
          <UiInput v-model="page" type="number" placeholder="예: 42" />
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-semibold text-foreground/80"
            >태그</label
          >
          <UiInput v-model="tagsRaw" placeholder="쉼표로 구분" />
        </div>
      </div>

      <!-- 메모 -->
      <div class="space-y-1.5">
        <label class="text-[13px] font-semibold text-foreground/80"
          >메모 (선택)</label
        >
        <UiTextarea
          v-model="memo"
          placeholder="이 문장에 대한 생각을 남겨보세요"
          class="min-h-20"
        />
      </div>

      <UiButton
        size="lg"
        class="w-full"
        :disabled="!canSave || saving"
        @click="save"
      >
        <Check class="size-5" />
        {{ saving ? "저장 중..." : "수집하기" }}
      </UiButton>
    </div>
  </UiDialog>
</template>
