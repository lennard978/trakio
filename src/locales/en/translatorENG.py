import json
import time
from deep_translator import GoogleTranslator

# CONFIGURATION
INPUT_FILE = "translation.json"
OUTPUT_FILE = "translation_DE.json"
BATCH_SIZE = 50  # Number of items to translate per batch
DELAY_BETWEEN_BATCHES = 2  # seconds

# Step 1: Load English JSON
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

keys = list(data.keys())
values = list(data.values())

translated = {}

# Step 2: Translate in batches
print("🔁 Starting batch translation...")
for i in range(0, len(values), BATCH_SIZE):
    batch_keys = keys[i:i + BATCH_SIZE]
    batch_values = values[i:i + BATCH_SIZE]
    
    try:
        # Translate whole batch at once using list comprehension
        batch_translations = [
            GoogleTranslator(source='auto', target='de').translate(text)
            for text in batch_values
        ]
        
        # Save batch translations
        for k, v in zip(batch_keys, batch_translations):
            translated[k] = v
        
        print(f"✅ Translated {i + len(batch_values)} of {len(values)}")

    except Exception as e:
        print(f"⚠️ Error in batch {i}–{i+BATCH_SIZE}: {e}")
        # fallback to original text if error occurs
        for k, v in zip(batch_keys, batch_values):
            translated[k] = v
    
    time.sleep(DELAY_BETWEEN_BATCHES)

# Step 3: Save translated JSON
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(translated, f, indent=4, ensure_ascii=False)

print("🎉 Translation completed. Output written to", OUTPUT_FILE)
