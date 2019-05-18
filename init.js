"use strict";

const Path = require( "path" );

[ 'js', 'xjs', 'ini', 'css', 'vert', 'frag', 'dep', 'yaml', 'tsx' ].forEach( function ( extension ) {
    atom.commands.add(
        'atom-text-editor',
        'toloframework:switch-to-' + extension,
        switchTo.bind( null, extension ) );
} );

atom.commands.add(
    'atom-text-editor',
    'toloframework:switch-to-spec',
    function () {
        const filename = getCurrentEditorPath();
        const parsing = Path.parse( filename );
        switchTo( "spec" + parsing.ext );
    } );

atom.commands.add(
    'atom-text-editor',
    'toloframework:switch-to-js',
    function () {
        const filename = getCurrentEditorPath();

        const parsing = Path.parse( filename );
        switchTo( "spec" + parsing.ext );
    } );

atom.commands.add(
    "atom-text-editor",
    "toloframework:beautify",
    function () {
        const filename = getCurrentEditorPath();
        const parsing = Path.parse( filename );
        alert( "Extension: " + parsing.ext );
        atom.commands.dispatch(
            "atom-text-editor",
            "atom-beautify:beautify-editor"
        );
    }
)

function switchTo( extension ) {
    const filename = getCurrentEditorPath();
    if ( !filename ) return;
    atom.workspace.activateNextPane();
    atom.workspace.open( replaceExtension( filename, extension ) );
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

function hyphenate( filename ) {
    const name = Path.parse( filename ).name;
    const parts = name.split( /[^a-zA-Z0-9]+/ );
    return parts.map( ( s ) => s.toLowercase() ).join( '-' );
}
