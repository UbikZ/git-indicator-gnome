const ITEMS = 10;       // number of items to list
const MORE = 50;        // number of items to list under "more..."
const BLACKLIST = "";   // to blacklist (hide) spezific MIME media types

const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();

let gitIndicator, repositories = [];

function sortfunc(x,y)
{
  return y[0] - x[0];
}

function Repository()
{
  this._init.apply(this, arguments);
}

Repository.prototype =
{
    __proto__: PopupMenu.PopupBaseMenuItem.prototype,

    _init: function(gicon, text, params)
    {
        PopupMenu.PopupBaseMenuItem.prototype._init.call(this, params);

        this.box = new St.BoxLayout({ style_class: 'popup-combobox-item' });

        if (gicon)
          this.icon = new St.Icon({ gicon: gicon, style_class: 'popup-menu-icon' });
        else
          this.icon = new St.Icon({ icon_name: 'edit-clear-symbolic', icon_size: 22 });

        this.box.add(this.icon);
        this.label = new St.Label({ text: text });
        this.box.add(this.label);
        this.actor.add(this.box);
    }
};

function GitIndicator()
{
  this._init.apply(this, arguments);
}

GitIndicator.prototype =
{
    __proto__: PanelMenu.Button.prototype,

    _init: function()
    {
        let [result, repositories] = GLib.spawn_sync(Me.path + '/scripts', ['main.sh', '--init'], null, 0, null);
        if (!result) {
          global.log('Can\'t init configuration for Git-Indicator');
        }
        let gicon = Gio.icon_new_for_string(Me.path + "/images/git.png");

        PanelMenu.Button.prototype._init.call(this, 0.0);
        this.connect('destroy', Lang.bind(this, this._onDestroy));
        this._iconActor = new St.Icon({ gicon: gicon, icon_size: 22 });
        this.actor.add_actor(this._iconActor);
        this.actor.add_style_class_name('panel-status-button');

        this.RecentManager = new Gtk.RecentManager();
        this._display();

        this.conhandler = this.RecentManager.connect('changed', Lang.bind(this, this._redisplay));

        Main.panel.addToStatusArea('git-indicator', this);
    },

    _onDestroy: function() {
        this.RecentManager.disconnect(this.conhandler);
    },

   _display: function()
   {

        let items = this.RecentManager.get_items();
        let modlist = new Array();
        let countItem = items.length;

        for (let i = 0; i < countItem; i++)
        {
          modlist[i] = new Array(2);
          modlist[i][0] = items[i].get_modified();
          modlist[i][1] = i;
        }

        modlist.sort(sortfunc);

        let id = 0;
        let idshow = 0;
        let blacklistString = BLACKLIST.replace(/\s/g, "");
        let blacklistList = blacklistString.split(",");

        while (idshow < ITEMS && id < countItem)
        {   let itemtype = items[modlist[id][1]].get_mime_type();
            if (blacklistList.indexOf((itemtype.split("/"))[0]) == -1)
            {
                let gicon = Gio.content_type_get_icon(itemtype);
                let menuItem = new Repository(gicon, items[modlist[id][1]].get_display_name(), {});
                this.menu.addMenuItem(menuItem);
                menuItem.connect('activate', Lang.bind(this, this._launchFile, items[modlist[id][1]].get_uri()));
                idshow++;
            }
            id++;
        }

        if (id < countItem && MORE > 0)
        {
            this.moreItem = new PopupMenu.PopupSubMenuMenuItem(_("More..."));
            this.menu.addMenuItem(this.moreItem);
            while (idshow < ITEMS+MORE && id < countItem)
            {
                let itemtype = items[modlist[id][1]].get_mime_type();
                if (blacklistList.indexOf((itemtype.split("/"))[0]) == -1)
                {
                    let gicon = Gio.content_type_get_icon(itemtype);
                    let menuItem = new Repository(gicon, items[modlist[id][1]].get_display_name(), {});
                    this.moreItem.menu.addMenuItem(menuItem);
                    menuItem.connect('activate', Lang.bind(this, this._launchFile, items[modlist[id][1]].get_uri()));
                    idshow++;
                }
                id++;
            }
        }

        if (countItem > 0)
        {
            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
            let menuItem = new Repository(false, 'Clear list', {});
            this.menu.addMenuItem(menuItem);
            menuItem.connect('activate', Lang.bind(this, this._clearAll));
        }
    },
    _redisplay: function()
    {
        this.menu.removeAll();
        this._display();
    },
    _launchFile: function(a, b, c)
    {
        Gio.app_info_launch_default_for_uri(c, global.create_app_launch_context(0, -1));
    },
    _clearAll: function()
    {
        let GtkRecent = new Gtk.RecentManager();
        GtkRecent.purge_items();
    },
};

function init()
{
}

function enable()
{
  gitIndicator = new GitIndicator();
}
function disable()
{
  gitIndicator.destroy();
}
