"use strict";

atom.commands.add( 'atom-text-editor', 'toloframework:switch-to-xjs', switchToXJS );

function switchToXJS() {
    const filename = getCurrentEditorPath();
    if ( !filename ) return;
    atom.workspace.open( replaceExtension( filename, ".xjs" ) );
    const editor = atom.workspace.getActiveTextEditor();
    if ( !editor.isEmpty() ) return;
    const buffer = editor.getBuffer();
    
}

function getCurrentEditorPath() {
    const editor = atom.workspace.getActiveTextEditor();
    if ( !editor ) return null;
    return editor.getPath();
}

function replaceExtension( filename, newExtension ) {
    const pos = filename.lastIndexOf( '.' );
    if ( newExtension.startsWith( "." ) ) {
        if ( pos < 0 ) return filename + newExtension;
        return filename.substr( 0, pos ) + newExtension;
    } else {
        if ( pos < 0 ) return filename + "." + newExtension;
        return filename.substr( 0, pos ) + "." + newExtension;
    }
}