# FAZET V6 Dashboard + Chat refinement

- Unified Perjalanan Kita + Hubungan Kita into one date-based timeline card.
- Replaced the welcome sentence with a live WIB clock and matching clock treatment.
- Academic Timeline now renders the entire active day without `.slice(0, 6)`.
- Pelajaran Besok now shows all subjects, not the first five only.
- Added dashboard Tugas list with direct Tambah Tugas modal.
- Added My Minee dashboard card and moved My Minee into the regular sidebar navigation.
- Added AI helper directly inside Chat with conversation-aware context.
- DeepSeek AI failure handling now classifies HTTP 402 as an exhausted balance and automatically falls through to the next provider; the DeepSeek model id is updated to `deepseek-flash`.
- Location/attendance remain absent from active navigation/routes; original files remain preserved.
