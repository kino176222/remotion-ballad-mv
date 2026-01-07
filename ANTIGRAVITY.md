# Project: Remotion Ballad MV (remotion-ballad-mv)

## 1. Project Overview
- **Goal**: バラード曲のエモーショナルなMVを作成し、歌詞（字幕）をのせる。
- **Target**: 既存のファンおよび新規リスナー（フォロワー増加を狙う）。
- **Usage**: YouTube（既存の動画ファイルと字幕ファイルを使用）。

## 2. Technical Stack
- **Core**: Remotion (React-based video creation)
- **Language**: TypeScript / JavaScript
- **Styling**: CSS / TailwindCSS (optional for easier styling)

## 3. MVP Features (Minimum Viable Product)
1.  **Project Setup**: Remotion環境の構築。
2.  **Asset Import**: 手持ちの動画ファイルと字幕ファイルの読み込み。
3.  **Basic Composition**: 動画に字幕を重ねて再生できるようにする。
4.  **Styling**: 曲の雰囲気に合わせたフォント・配置・アニメーションの調整。
5.  **Rendering**: YouTube用動画としての書き出し。

## 4. Current Step
- [x] **Phase 1: Foundation** (Done)
    - Project setup & messy file cleanup.
    - Video & Lyrics (LRC) integration.
    - Basic subtitle synchronization.
- [x] **Phase 2: Styling & Emotion** (Done)
    - Font selection: 'Shippori Mincho' for emotionally resonant, cinematic text.
    - Text positioning: Raised slightly for better visibility.
    - Animations: Fade-in & slight slide-up, with fade-out at end of phrase.
- [ ] **Phase 3: Refinement & Polish** (Current Priority)
    1.  **Fundamental Design**:
        - Change font to 'Zen Old Mincho' (ink-bleed style).
        - Switch to Vertical writing mode (Vertial-RL).
        - Adjust position to lower area (over black bar).
    2.  **Special FX**:
        - Implement particle assembly animation specifically for "空なんて" lyrics.
    3.  **Advanced Timing**:
        - Test character-by-character display (typewriter effect).
    4.  **Export**:
        - Final YouTube render.
