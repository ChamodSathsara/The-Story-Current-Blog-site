import React, { useEffect, useState } from "react";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { AlignCenter, AlignLeft, AlignRight, Bold, ImagePlus, Italic, Link2, List, ListOrdered, Pilcrow, Quote, Redo2, Table as TableIcon, Undo2, Unlink, BoxIcon } from "lucide-react";
import { useStore } from "../../contexts/StoreContext";
import { MediaPicker } from "./MediaPicker";
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onReady?: (editor: Editor) => void;
}
export function RichTextEditor({
  value,
  onChange,
  onReady
}: RichTextEditorProps) {
  const {
    db
  } = useStore();
  const [picker, setPicker] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      }
    }), LinkExt.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: {
        rel: 'noopener noreferrer'
      }
    }), ImageExt.configure({
      inline: false
    }), Table.configure({
      resizable: false
    }), TableRow, TableHeader, TableCell, TextAlign.configure({
      types: ['heading', 'paragraph']
    }), Placeholder.configure({
      placeholder: 'Write your article… Use H2 headings to structure sections.'
    })],
    content: value,
    onUpdate: ({
      editor: e
    }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class: 'article-body',
        'aria-label': 'Article body',
        role: 'textbox',
        'aria-multiline': 'true'
      }
    }
  });
  useEffect(() => {
    if (editor && onReady) onReady(editor);
  }, [editor, onReady]);
  if (!editor) return <div className="h-[480px] animate-pulse rounded-lg border border-border bg-muted" />;
  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL (https://… or /article/slug)', prev ?? 'https://');
    if (url === null) return;
    if (url === '') return void editor.chain().focus().extendMarkRange('link').unsetLink().run();
    if (!/^(https?:\/\/|\/|mailto:)/.test(url)) return window.alert('Links must start with https://, / or mailto:');
    const external = /^https?:\/\//.test(url) && !url.startsWith(db.settings.siteUrl);
    editor.chain().focus().extendMarkRange('link').setLink({
      href: url,
      target: external ? '_blank' : null
    }).run();
  };
  const insertImage = (id: string) => {
    const m = db.media.find((x) => x.id === id);
    if (!m) return;
    const caption = [m.caption, m.credit && `Credit: ${m.credit}`].filter(Boolean).join(' — ');
    const chain = editor.chain().focus().setImage({
      src: m.url,
      alt: m.alt,
      title: m.title
    });
    if (caption) chain.insertContent(`<p><em>${caption.replace(/</g, '&lt;')}</em></p>`);
    chain.run();
  };
  const btn = (active: boolean) => `inline-flex h-8 min-w-8 items-center justify-center rounded px-1.5 text-sm transition ${active ? 'bg-brand-soft text-brand-deep' : 'text-ink/70 hover:bg-muted hover:text-ink'} disabled:opacity-30`;
  const sep = <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />;
  const inTable = editor.isActive('table');
  type Tool = {
    label: string;
    Icon: typeof Bold;
    run: () => void;
    active?: boolean;
    disabled?: boolean;
  };
  const groups: Tool[][] = [[{
    label: 'Undo',
    Icon: Undo2,
    run: () => editor.chain().focus().undo().run(),
    disabled: !editor.can().undo()
  }, {
    label: 'Redo',
    Icon: Redo2,
    run: () => editor.chain().focus().redo().run(),
    disabled: !editor.can().redo()
  }], [{
    label: 'Paragraph',
    Icon: Pilcrow,
    run: () => editor.chain().focus().setParagraph().run(),
    active: editor.isActive('paragraph')
  }, {
    label: 'Heading 1',
    Icon: BoxIcon,
    run: () => editor.chain().focus().toggleHeading({
      level: 1
    }).run(),
    active: editor.isActive('heading', {
      level: 1
    })
  }, {
    label: 'Heading 2',
    Icon: BoxIcon,
    run: () => editor.chain().focus().toggleHeading({
      level: 2
    }).run(),
    active: editor.isActive('heading', {
      level: 2
    })
  }, {
    label: 'Heading 3',
    Icon: BoxIcon,
    run: () => editor.chain().focus().toggleHeading({
      level: 3
    }).run(),
    active: editor.isActive('heading', {
      level: 3
    })
  }], [{
    label: 'Bold',
    Icon: Bold,
    run: () => editor.chain().focus().toggleBold().run(),
    active: editor.isActive('bold')
  }, {
    label: 'Italic',
    Icon: Italic,
    run: () => editor.chain().focus().toggleItalic().run(),
    active: editor.isActive('italic')
  }, {
    label: 'Link',
    Icon: Link2,
    run: setLink,
    active: editor.isActive('link')
  }, {
    label: 'Remove link',
    Icon: Unlink,
    run: () => editor.chain().focus().unsetLink().run(),
    disabled: !editor.isActive('link')
  }], [{
    label: 'Bullet list',
    Icon: List,
    run: () => editor.chain().focus().toggleBulletList().run(),
    active: editor.isActive('bulletList')
  }, {
    label: 'Numbered list',
    Icon: ListOrdered,
    run: () => editor.chain().focus().toggleOrderedList().run(),
    active: editor.isActive('orderedList')
  }, {
    label: 'Blockquote',
    Icon: Quote,
    run: () => editor.chain().focus().toggleBlockquote().run(),
    active: editor.isActive('blockquote')
  }], [{
    label: 'Align left',
    Icon: AlignLeft,
    run: () => editor.chain().focus().setTextAlign('left').run(),
    active: editor.isActive({
      textAlign: 'left'
    })
  }, {
    label: 'Align center',
    Icon: AlignCenter,
    run: () => editor.chain().focus().setTextAlign('center').run(),
    active: editor.isActive({
      textAlign: 'center'
    })
  }, {
    label: 'Align right',
    Icon: AlignRight,
    run: () => editor.chain().focus().setTextAlign('right').run(),
    active: editor.isActive({
      textAlign: 'right'
    })
  }], [{
    label: 'Insert image',
    Icon: ImagePlus,
    run: () => setPicker(true)
  }, {
    label: 'Insert table',
    Icon: TableIcon,
    run: () => editor.chain().focus().insertTable({
      rows: 3,
      cols: 3,
      withHeaderRow: true
    }).run()
  }]];
  return <div className="tsc-editor overflow-hidden rounded-lg border border-border bg-white focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
      <div role="toolbar" aria-label="Formatting" className="sticky top-16 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-white px-2 py-1.5">
        {groups.map((g, i) => <React.Fragment key={i}>
            {i > 0 && sep}
            {g.map(({
          label,
          Icon,
          run,
          active,
          disabled
        }) => <button key={label} type="button" title={label} aria-label={label} aria-pressed={active} onClick={run} disabled={disabled} className={btn(!!active)}>
                <Icon className="h-4 w-4" />
              </button>)}
          </React.Fragment>)}
        {inTable && <>
            {sep}
            {[['+ Row', () => editor.chain().focus().addRowAfter().run()], ['+ Col', () => editor.chain().focus().addColumnAfter().run()], ['− Row', () => editor.chain().focus().deleteRow().run()], ['− Col', () => editor.chain().focus().deleteColumn().run()], ['Delete table', () => editor.chain().focus().deleteTable().run()]].map(([label, fn]) => <button key={label as string} type="button" onClick={fn as () => void} className={`${btn(false)} text-xs font-medium`}>{label as string}</button>)}
          </>}
      </div>
      <EditorContent editor={editor} />
      <MediaPicker open={picker} onOpenChange={setPicker} title="Insert image" onSelect={insertImage} />
    </div>;
}