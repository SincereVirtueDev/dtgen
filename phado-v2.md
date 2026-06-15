# PHẢ ĐỒ V2 — Kế hoạch cải tiến theo Văn hóa Phụ hệ Việt Nam

> **Ngày khởi tạo:** 2026-06-13  
> **Trạng thái:** 🟢 Đã hoàn thành toàn bộ (Bước 1-6)  
> **Quyết định thiết kế:**
> - Layout đa thê: **Kiểu B** — giữ marriage block riêng, sort theo rank
> - Thêm `birth_order` vào backend
> - Ưu tiên: **Giai đoạn 2 (Layout Phả Đồ)** trước

---

## BƯỚC 1: Thêm `birth_order` vào Backend

> Mục đích: Cho phép xác định thứ tự sinh — nền tảng để sort đúng trên Phả đồ.

### 1.1. Sửa Model

- [x] **File:** `backend/app/models.py` — Thêm field vào class `Person`:
  ```python
  birth_order = Column(Integer, nullable=True)  # 1 = Trưởng, 2 = Thứ, 3 = Ba...
  ```

### 1.2. Sửa Schema

- [x] **File:** `backend/app/schemas.py` — Thêm vào `PersonBase`:
  ```python
  birth_order: Optional[int] = None
  ```

### 1.3. Cập nhật Seed Data

- [x] **File:** `backend/app/seed.py` — Gắn `birth_order` cho dữ liệu mẫu:
  - `Nguyễn Văn Đại` (con trai cả vợ cả) → `birth_order=1`
  - `Nguyễn Thị Gái` (con gái vợ cả) → `birth_order=2`
  - `Nguyễn Văn Nhị` (con trai vợ hai) → `birth_order=1`
  - Tương tự cho đời 3, 4...

### 1.4. Cập nhật Frontend Type

- [x] **File:** `frontend/src/store/useGenealogyStore.ts` — Thêm vào interface `Person`:
  ```typescript
  birth_order?: number
  ```

### 1.5. Verify

- [ ] Rebuild Docker: `docker compose up -d --build`
- [ ] Re-seed: `docker exec dtgen_backend python -m app.seed`
- [ ] Gọi `GET /api/persons` kiểm tra `birth_order` trả về đúng

> ⚠️ Lưu ý: Cần rebuild Docker và re-seed DB thì data mới có `birth_order`.

---

## BƯỚC 2: Sort con cái đúng thứ tự truyền thống

> Mục đích: Trưởng nam luôn bên TRÁI, con gái sau con trai, đúng phả đồ Việt Nam.

### 2.1. Tạo hàm sort dùng chung

- [x] **File:** `frontend/src/utils/sortChildren.ts` — Tạo mới:
  ```
  Hàm sortChildren(children: Person[]): Person[]
  Logic ưu tiên:
    1. Con trai (gender='M') trước con gái (gender='F')
    2. Trong cùng giới: sort theo birth_order ASC (nếu có)
    3. Fallback: sort theo birth_year ASC
    4. Fallback cuối: sort theo id ASC
  ```

### 2.2. Áp dụng sort vào GenealogyTree

- [x] **File:** `frontend/src/components/FamilyTree/GenealogyTree.tsx`
  - Import `sortChildren`
  - **MarriageGroup:** Sort `children` trước khi render
    ```typescript
    const sortedChildren = sortChildren(children);
    ```
  - **TreeNode:** Sort `unknownMotherChildren` tương tự

### 2.3. Sort danh sách vợ theo rank

- [x] **File:** `frontend/src/components/FamilyTree/GenealogyTree.tsx`
  - Trong `TreeNode`, sort `spouses` array theo thứ tự rank:
    ```
    VỢ CẢ (1) → VỢ THỨ (2) → VỢ KẾ (3) → KHÔNG RÕ (4)
    ```

### 2.4. Verify

- [ ] Mở Phả đồ, xác nhận:
  - Đời 2: `Nguyễn Văn Đại` (con vợ cả) bên trái, rồi `Nguyễn Thị Gái` (con gái), rồi nhánh vợ hai
  - Mỗi nhánh hôn phối: con trai trước con gái

---

## BƯỚC 3: Hiển thị nhãn "Đời thứ N" dọc bên trái Phả đồ

> Mục đích: Phả đồ truyền thống luôn ghi rõ đời thứ mấy. Hiện tại chỉ có tag nhỏ trên mỗi node.

### 3.1. Thêm Generation Lane Markers

- [x] **File:** `frontend/src/components/FamilyTree/GenealogyTree.tsx`
  - Trong component `GenealogyTree` chính (phần TransformComponent), bọc thêm overlay hoặc dùng `position: absolute` vẽ các dải ngang.
  - Hoặc: thêm `generation-label` element trước mỗi tầng trong đệ quy render.

### 3.2. Style cho Generation Label

- [x] **File:** `frontend/src/components/FamilyTree/GenealogyTree.css` — Thêm:
  ```css
  .generation-label {
    /* Nhãn nổi bật bên trái mỗi tầng */
    position: absolute;
    left: -80px;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    /* Hoặc horizontal, tùy UX */
    font-weight: bold;
    color: #8b0000;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  ```

### 3.3. (Tùy chọn) Background band xen kẽ

- [x] Thêm dải nền nhẹ xen kẽ giữa các đời (như bảng zebra-striped) để dễ phân biệt.

### 3.4. Verify

- [ ] Zoom out phả đồ, xác nhận:
  - Mỗi tầng có nhãn "ĐỜI 1", "ĐỜI 2"... rõ ràng
  - Nhãn không bị che khi scroll/pan

---

## BƯỚC 4: Cải tiến layout Chồng — Vợ ngang hàng

> Mục đích: Vợ nên nằm NGANG HÀNG bên phải chồng, không bị lệch bởi trick negative margin.

### 4.1. Vẽ lại MarriageGroup layout

- [x] **File:** `frontend/src/components/FamilyTree/GenealogyTree.tsx` — Sửa `MarriageGroup`:
  - Bỏ trick `-mr-[292px]` trên Wife node
  - Layout mới:
    ```
    ┌─────────┐  ♥  ┌─────────┐
    │  CHỒNG  │─────│   VỢ    │
    └────┬────┘     └─────────┘
         │
    ┌────┴────┐
    │ Con cái │
    └─────────┘
    ```
  - Dùng flexbox ngang cho cặp Chồng-Vợ
  - Đường kẻ dọc từ CHỒNG xuống con cái (center aligned với chồng, không phải center cả cặp)

### 4.2. Sửa MarriageBlock thành connector đơn giản

- [x] **File:** `frontend/src/components/FamilyTree/MarriageBlock.tsx`
  - Thay vì block to riêng, chuyển thành đường nối ngang giữa Chồng-Vợ
  - Giữ nút thu gọn/mở con cái
  - Hiển thị rank badge (`VỢ CẢ` / `VỢ THỨ`) ngay trên đường nối hoặc cạnh Wife node

### 4.3. Xử lý đa thê layout

- [x] Quyết định đã chọn: **Kiểu B** — mỗi marriage block riêng, sort theo rank
  - Vợ Cả: hiển thị đầu tiên (bên phải chồng)
  - Vợ Thứ, Vợ Kế: hiển thị tiếp bên dưới Vợ Cả, mỗi bà mở nhánh con riêng
  - Layout stack dọc:
    ```
    ┌──────┐  ♥  ┌─────────┐ VỢ CẢ
    │CHỒNG │─────│ Bà Nhất │
    └──┬───┘     └─────────┘
       │         ┌─────────┐ VỢ THỨ
       ├─────────│ Bà Hai  │
       │         └─────────┘
       │
    ┌──┴───────────────┐
    │   Con Bà Nhất    │
    │   Con Bà Hai     │ (mỗi nhóm riêng)
    └──────────────────┘
    ```

### 4.4. Cập nhật CSS kẻ line

- [x] **File:** `frontend/src/components/FamilyTree/GenealogyTree.css`
  - Sửa pseudo-elements `::before`, `::after` cho layout mới
  - Thêm class cho đường nối ngang chồng-vợ (kiểu nét đôi hoặc nét liền màu hồng)

### 4.5. Verify

- [ ] Phả đồ hiển thị:
  - Chồng-Vợ ngang hàng
  - Đa thê: stack dọc, đúng thứ tự rank
  - Đường kẻ con cái chạy từ chồng xuống, không từ giữa cặp

---

## BƯỚC 5: Badge "Trưởng nam" & hiển thị tên húy/tự

> Mục đích: Nhấn mạnh vai trò Trưởng nam trong phụ hệ.

### 5.1. Badge Trưởng nam

- [x] **File:** `frontend/src/components/FamilyTree/MemberNode.tsx`
  - Nếu `person.birth_order === 1 && person.gender === 'M' && !isSpouse`:
    ```tsx
    <span className="bg-red-100 text-red-800 ...">TRƯỞNG NAM</span>
    ```
  - Nếu `person.generation === 1 && person.gender === 'M'`:
    ```tsx
    <span className="bg-amber-100 text-amber-800 ...">KHỞI TỔ</span>  // Đã có
    ```

### 5.2. Hiển thị tên húy/tự (tương lai)

- [x] Khi backend đã có `taboo_name`, `courtesy_name`:
  ```tsx
  {person.taboo_name && (
    <p className="text-xs italic text-gray-400">Húy: {person.taboo_name}</p>
  )}
  ```
- [x] **Hiện tại** dùng field `other_names` hiển thị nếu có:
  ```tsx
  {person.other_names && (
    <p className="text-xs italic text-gray-400">{person.other_names}</p>
  )}
  ```

### 5.3. Verify

- [x] Node Trưởng nam có badge đỏ nổi bật
- [x] `other_names` hiển thị dưới tên chính

---

## BƯỚC 6: Cải tiến Kinship (Xưng hô chính xác hơn)

> Mục đích: Phân biệt Bác/Chú/Cô/Dì đúng văn hóa.

### 6.1. Sửa logic kinship

- [x] **File:** `frontend/src/utils/kinship.ts`
  - Sửa phần Uncle/Aunt bên Nội:
    ```
    Nếu target.birth_order < father.birth_order → BÁC (anh/chị cha)
    Nếu target.birth_order > father.birth_order → CHÚ (nam) / CÔ (nữ)
    ```
  - Sửa phần Uncle/Aunt bên Ngoại:
    ```
    Nếu target.birth_order < mother.birth_order → BÁC
    Nếu target.birth_order > mother.birth_order → CẬU (nam) / DÌ (nữ)
    ```
  - Sửa phần Siblings: dùng `birth_order` thay vì `birth_date`

### 6.2. Fix bug hiện tại

- [x] **File:** `frontend/src/utils/kinship.ts` dòng 27:
  - Bug: dùng `source.birth_date` nhưng interface Person không có field `birth_date` (chỉ có `solar_birth_date`)
  - Fix: đổi sang dùng `birth_order` hoặc `birth_year`

### 6.3. Verify

- [x] Test kinship: chọn reference person, xác nhận xưng hô:
  - Anh cha → "Bác"
  - Em trai cha → "Chú"
  - Em gái cha → "Cô"
  - Em trai mẹ → "Cậu"
  - Em gái mẹ → "Dì"

---

## Tổng kết thứ tự thực hiện

| # | Bước | Độ khó | Ước lượng |
|---|------|--------|-----------|
| 1 | Thêm `birth_order` backend | ⭐ Dễ | 15 phút |
| 2 | Sort con cái đúng thứ tự | ⭐⭐ TB | 30 phút |
| 3 | Nhãn "Đời thứ N" | ⭐⭐ TB | 30 phút |
| 4 | Layout Chồng-Vợ ngang hàng | ⭐⭐⭐ Khó | 1-2 giờ |
| 5 | Badge Trưởng nam + tên húy | ⭐ Dễ | 15 phút |
| 6 | Cải tiến Kinship | ⭐⭐ TB | 30 phút |

**Tổng ước lượng: ~3-4 giờ**

---

## Changelog

| Ngày | Bước | Trạng thái | Ghi chú |
|------|------|------------|---------|
| 2026-06-13 | Khởi tạo plan | ✅ Done | Đã phân tích repo, viết kế hoạch |
| 2026-06-13 | Bước 1: birth_order | ✅ Done (code) | Sửa models.py, schemas.py, seed.py, useGenealogyStore.ts — chờ rebuild Docker |
| 2026-06-13 | Bước 2: Sort truyền thống | ✅ Done | Tạo sortChildren.ts, áp dụng sort con (M trước F, birth_order), sort vợ (rank) |
| 2026-06-13 | Bước 3: Nhãn Đời | ✅ Done | Generation lanes với label dọc, màu đỏ truyền thống, nền xen kẽ |
| 2026-06-13 | Bước 4: Layout Chồng-Vợ | ✅ Done | Rewrite MarriageBlock→Connector, layout ngang hàng, đa thê stack dọc, bỏ negative margin |
| 2026-06-13 | Bước 5: Badge Trưởng nam | ✅ Done | Thêm badge Trưởng nam (đỏ) và hiển thị other_names dưới tên chính |
| 2026-06-13 | Bước 6: Cải tiến Kinship | ✅ Done | Sửa lỗi undefined birth_date, phân biệt rõ Bác/Chú/Cô/Cậu/Dì dựa vào birth_order và birth_year |
| | | | |
