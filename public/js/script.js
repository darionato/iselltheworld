// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Sell Model
  // ----------

  // Our basic **Sell** model has `date`, `desc`, and `contact` attributes.
  window.Sell = Backbone.Model.extend({
    idAttribute: "_id",

    // Default attributes for a sell item.
    defaults: function() {
      return {
        date: new Date(),
      };
    }

  });

  // Sales Collection
  // ---------------

  // The collection of sales used to be backed by *localStorage* instead of a remote
  // server, but now uses our /api/sales backend for persistance.
  window.SalesList = Backbone.Collection.extend({

    initialize: function(models, options) {
      this.url = options.url;
    },


    // Reference to this collection's model.
    model: Sell,

    // Sales are sorted by their original insertion order.
    comparator: function(sell) {
      return sell.get('date');
    }

  });

  // Create our global collection of **Sales**.
  window.Sales = new SalesList([], { url: '/api/sales' });

  // Create our global collection of **Latest Sales**.
  window.LatestSales = new SalesList([], { url: '/api/latestsales' });


  // Sell Item View
  // --------------

  // The DOM element for a sell item...
  window.SellView = Backbone.View.extend({


    //... is a list tag.
    tagName: "div",


    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),


    // Re-render the contents of the sell item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.setDesc();
      this.setContact();
      this.setDate();
      return this;
    },


    // To avoid XSS (not that it would be harmful in this particular app),
    // we use `jQuery.text` to set the contents of the sell item.
    setDesc: function() {
      var desc = this.model.get('desc');
      this.$('.sell-desc').text(desc);
    },


    // To avoid XSS (not that it would be harmful in this particular app),
    // we use `jQuery.text` to set the contents of the sell item.
    setContact: function() {
      var contact = this.model.get('contact');
      this.$('.sell-contact').text(contact);
    },

    // To avoid XSS (not that it would be harmful in this particular app),
    // we use `jQuery.text` to set the contents of the sell item.
    setDate: function() {
      var date = new Date(this.model.get('date'));
      this.$('.sell-date').text($.formatDate(date));
    }


  });


  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  window.AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#sellform"),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "click #new-button": "createOnSubmit"
    },

    // At initialization we bind to the relevant events on the `Sales`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting sales that might be saved in *localStorage*.
    initialize: function() {
      
      _.bindAll(this);

      this.contactInput = this.$("#new-contact");
      this.descInput = this.$("#new-desc");

      Sales.bind('add',   this.addSell, this);
      Sales.bind('reset', this.addAll, this);

      Sales.fetch();


      LatestSales.bind('add',   this.addLatestSell, this);
      LatestSales.bind('reset', this.addAllLatest, this);

      LatestSales.fetch();
    },


    addSell: function(sell) {
      this.addOne(sell, "#sell-list");
    },

    addLatestSell: function(sell) {
      this.addOne(sell, "#latest-sell-list");
    },


    // Add a single sell item to the list by creating a view for it
    addOne: function(sell, id) {
      var view = new SellView({model: sell});
      $(id).prepend(view.render().el);
    },


    // Add all items in the **Sales** collection at once.
    addAll: function() {
      Sales.each(this.addSell);
    },

    // Add all items in the **Latest Sales** collection at once.
    addAllLatest: function() {
      LatestSales.each(this.addLatestSell);
    },


    // If you hit return in the main input field, and there is text to save,
    // create new **Sell** model persisting it to *localStorage*.
    createOnSubmit: function() {

      var contact = this.contactInput.val();
      if (!contact) return;

      var desc = this.descInput.val();
      if (!desc) return;

      Sales.create({
        date: new Date(),
        desc: desc,
        contact: contact
      });
      this.descInput.val('');
    }


  });


  // Finally, we kick things off by creating the **App**.
  window.App = new AppView;


});