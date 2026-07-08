# Phase 4: Dynamic Customization Engine

## 1. Goal
Implement a no-code customization schema builder for admin users, enabling dynamic storefront forms and canvas preview rendering without code changes.

---

## 2. Features Completed
* **No-Code Schema Configuration:** Schema definitions supporting 9 field types (text, upload, color, checkbox, dimension, dropdown, radio, etc.).
* **Dynamic Form rendering:** A runtime `FieldRenderer` UI component that parses database schemas into interactive inputs.
* **Canvas Template Mapping:** Field-level positioning coordinates, font styling, and color overlays stored directly inside schemas.
* **Image Upload Guardrails:** Upload pipelines validating file sizes, MIME configurations, and magic byte patterns.
* **Saved Designs:** Saved designs synced to user profiles for reuse across checkout sessions.

---

## 3. Technical Implementation
* **JSONB Schema Models:** Catalog entries store validation structures in a `customizationSchema` field:
  ```json
  {
    "fields": [
      {
        "id": "field-uuid",
        "type": "text",
        "label": "Employee Name",
        "required": true,
        "validation": { "maxLength": 50 },
        "previewConfig": { "canvasX": 100, "canvasY": 200 }
      }
    ]
  }
  ```
* **Dynamic Validators:** Instantiated client-side and server-side Zod validation maps at runtime based on the loaded field JSON requirements.

---

## 4. Challenges Solved
* **Customization Form Validation:** Resolved validation complexity by writing a dynamic parser that converts JSON schema constraints into runtime Zod objects on both frontend and backend systems.
* **File Type Spoofing:** Blocked attacks where malicious actors renamed executable binaries to `.png` extensions. Handled this by validating the file's header signature (magic bytes) inside Express multer middlewares.

---

## 5. Deliverables
* `/apps/api/src/modules/customization/` — Backend schema and layout controllers.
* `/apps/customer/src/components/FieldRenderer.tsx` — Dynamic component builder.
* `/apps/api/src/middleware/fileUpload.ts` — Magic-byte validator middleware.
