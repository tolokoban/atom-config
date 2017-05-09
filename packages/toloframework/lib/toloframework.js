'use babel';

import ToloframeworkView from './toloframework-view';
import { CompositeDisposable } from 'atom';

export default {

  toloframeworkView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.toloframeworkView = new ToloframeworkView(state.toloframeworkViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.toloframeworkView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'toloframework:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.toloframeworkView.destroy();
  },

  serialize() {
    return {
      toloframeworkViewState: this.toloframeworkView.serialize()
    };
  },

  toggle() {
    console.log('Toloframework was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  },

  switchToCss() {
    
  }
};
