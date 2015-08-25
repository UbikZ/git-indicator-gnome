const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const COUNT_ITEMS = 10;
const COUNT_MORE = 50;

let gitIndicator, repositories = [];

function sortfunc(x, y) {
  return y[0] - x[0];
}

function Repository() {
  this._init.apply(this, arguments);
}

Repository.prototype =
{
  __proto__: PopupMenu.PopupBaseMenuItem.prototype,

  _init: function (gicon, text, params) {
    PopupMenu.PopupBaseMenuItem.prototype._init.call(this, params);

    this.box = new St.BoxLayout({style_class: 'popup-combobox-item'});

    if (gicon) {
      this.icon = new St.Icon({gicon: gicon, style_class: 'popup-menu-icon'});
      this.box.add(this.icon);
    }

    this.label = new St.Label({text: text});
    this.box.add(this.label);
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

    repositories = out.toString().split('\n');

    if (!result) {
      global.log('Can\'t init configuration for Git-Indicator');
    }

    PanelMenu.Button.prototype._init.call(this, 0.0);
    this.connect('destroy', Lang.bind(this, this._onDestroy));
    this._iconActor = new St.Icon({gicon: gicon, icon_size: 22});
    this.actor.add_actor(this._iconActor);
    this.actor.add_style_class_name('panel-status-button');
    this._display();
    Main.panel.addToStatusArea('git-indicator', this);
  },

  _onDestroy: function () {
    // todo
  },

  _display: function () {
    let that = this, countItem = 0;

    repositories.forEach(function(repository) {
      countItem++;
      if (countItem < COUNT_ITEMS) {
        //let gicon = Gio.icon_new_for_string(Me.path + "/images/git.png");
        let repositoryItem = new Repository(undefined, repository, {});
        that.menu.addMenuItem(repositoryItem);
      }
    });
  },
  _refresh: function () {
    this.menu.removeAll();
    this._display();
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
