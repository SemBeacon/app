import 'monaco-editor/features/iPadShowKeyboard/register';
import 'monaco-editor/features/inspectTokens/register';

import * as monaco from 'monaco-editor/editor/editor.api';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';

// Only the base editor worker is needed: Turtle highlighting uses TextMate grammars
// (monaco-editor-textmate), not a Monaco language worker
self.MonacoEnvironment = {
    getWorker: () => new EditorWorker(),
};

export { monaco };
