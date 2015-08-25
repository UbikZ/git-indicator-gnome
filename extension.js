const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Mainloop = imports.mainloop;

const COUNT_ITEMS = 10;
const COUNT_MORE = 50;

let gitIndicator, repositories = [];


function Repository() {
  this._init.apply(this, arguments);
}

Repository.prototype =
{
  __proto__: PopupMenu.PopupBaseMenuItem.prototype,

  _init: function (state, text, percentage, params) {
    PopupMenu.PopupBaseMenuItem.prototype._init.call(this, params);

    let [cssClass, iconState] = state;
    this.box = new St.BoxLayout({style_class: 'popup-combobox-item'});

    /*this.box.add(iconState);
     this.box.add(new St.Label({text: " "}));*/

    let repositoryBox = new St.BoxLayout({style_class: cssClass});
    repositoryBox.add(new St.Label({text: text}));
    this.box.add(repositoryBox);

    this.box.add(new St.Label({text: " - "}));

    let percentageBox = new St.BoxLayout({style_class: cssClass});
    percentageBox.add(new St.Label({text: percentage + "%"}));
    this.box.add(percentageBox);

    this.actor.add(this.box);
  }
};

function GitIndicator() {
  this._init.apply(this, arguments);
}

GitIndicator.prototype =
{
  __proto__: PanelMenu.Button.prototype,

  _init: function () {
    let [result, out] = GLib.spawn_sync(Me.path + '/scripts', ['main.sh', '--init'], null, 0, null);
    let gicon = Gio.icon_new_for_string(Me.path + "/images/git.png");

    if (!result) {
      global.log('Can\'t init configuration for Git-Indicator');
    }

    out.toString().split('\n').forEach(function (repository) {
      repositories.push({'path': repository, 'perc': 100})
    });

    PanelMenu.Button.prototype._init.call(this, 0.0);
    this.connect('destroy', Lang.bind(this, this._onDestroy));
    this._iconActor = new St.Icon({gicon: gicon, icon_size: 22});
    this.actor.add_actor(this._iconActor);
    this.actor.add_style_class_name('panel-status-button');
    this._display();
    Main.panel.addToStatusArea('git-indicator', this);
    Mainloop.timeout_add(1000, Lang.bind(this, this._refresh));
  },

  _onDestroy: function () {
    // todo
  },

  _display: function () {
    let that = this, countItem = 0;

    repositories.forEach(function (repository) {
      countItem++;
      if (countItem < COUNT_ITEMS) {
        //let gicon = Gio.icon_new_for_string(Me.path + "/images/git.png");
        let repositoryItem = new Repository(that._getState(repository.perc), repository.path, repository.perc, {});
        that.menu.addMenuItem(repositoryItem);
      }
    });
  },
  _getState: function (percentage) {
    let cssClass = 'sync';
    let path = 'git.png';
    percentage = percentage || 0;
    if (percentage <= 50) {
      cssClass = 'async-zero';
      path = 'git-attention.png'
    } else if (percentage != 100) {
      cssClass = 'async';
      path = 'git-attention.png'
    }

    return [cssClass, new St.Icon({gicon: Gio.icon_new_for_string(Me.path + "/images/" + path), icon_size: 20})];
  },
  _refresh: function () {
    global.log("test");
    this.menu.removeAll();
    this._display();
    //Mainloop.timeout_add(1000, Lang.bind(this, this._refresh));
  },
  _displayInfo: function (repository) {
    // todo
  }
};

function init() {
}

function enable() {
  gitIndicator = new GitIndicator();
}
function disable() {
  gitIndicator.destroy();
}
