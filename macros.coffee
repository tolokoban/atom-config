# All functions defined on "this" are available as atom commands.
#
# If the `toolbar` package is installed, toolbar icons are automatically generated.
#
# Set these properties of your function to configure the icons:
# * icon - name of the icon (Or a method returning the icon name, possibly prepended with 'ion-' or 'fa-')
# * title - The toolbar title (or a method returning the title)
# * hideIcon - set to true to hide the icon from the toolbar
#

'atom-text-editor':
  'alt--': 'editor:fold-all'
  'alt-+': 'editor:unfold-all'
  'ctrl--': 'editor:fold-current-row'
  'ctrl-+': 'editor:unfold-current-row'
  'f12 j': 'macros:tfwSwitchToJS'
  'f12 x': 'macros:tfwSwitchToXJS'
  'f12 c': 'macros:tfwSwitchToCSS'
  'f12 i': 'macros:tfwSwitchToINI'
  'f12 d': 'macros:tfwSwitchToDEP'
  'f12 v': 'macros:tfwSwitchToVERT'
  'f12 f': 'macros:tfwSwitchToFRAG'

'atom-text-editor[data-grammar="source gfm"]:not([mini])':
  'tab': 'markdown-folding:cycle' 

'.platform-win32 atom-workspace, .platform-linux atom-workspace':
  'alt-shift-T': 'atom-ide-terminal:new-terminal'

'.platform-win32, .platform-linux':
  'alt-$': 'tree-view:toggle-focus'
  'ctrl-$': 'tree-view:toggle'