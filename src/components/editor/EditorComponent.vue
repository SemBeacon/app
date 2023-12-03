<template>
  <div id="editor"></div>
</template>

<script lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import { Options, Vue } from 'vue-property-decorator';
import loader from "@monaco-editor/loader";
import { Registry } from 'monaco-textmate';
import { wireTmGrammars } from 'monaco-editor-textmate';
import { editor } from 'monaco-editor';
import { loadWASM } from 'onigasm';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

@Options({
  components: {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent
  }
})
export default class EditorComponent extends Vue {
  editor: editor.IStandaloneCodeEditor;

  async beforeMount() {
    await loadWASM("/js/vendor/onigasm/onigasm.wasm");
  }

  mounted(): void {
    loader.init().then((monaco) => {
      monaco.editor.setTheme(prefersDark.matches ? 'vs-dark' : 'vs');
      const registry = new Registry({
        getGrammarDefinition: async () => {
          return {
            format: 'json',
            content: await (await fetch(`assets/grammars/turtle.tmLanguage.json`)).text()
          }
        }
      });
      const grammars = new Map();
      grammars.set('turtle', 'source.ttl');

      monaco.languages.register({ id: "turtle" });
      this.editor = monaco.editor.create(document.getElementById("editor") as HTMLElement, 
        {
          value: "",
          language: "turtle",
          minimap: { enabled: false },
        });
      return wireTmGrammars(monaco, registry, grammars, this.editor);
    }).catch(console.error);
  }

  get value(): string {
    return this.editor.getValue();
  }
}
</script>

<style scoped>
#editor {
  width: 100%;
  height: 100%;
}
</style>