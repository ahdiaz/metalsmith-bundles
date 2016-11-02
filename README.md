# metalsmith-bundles

Handles javascript and css resources as bundles for easy (conditional) inclusion in templates.
This plugin works with [handlebars-helper-bundles], which renders the resources in the templates.

Most of the time when you make use of some library you need to include different resources in your page templates, in different places actually. Take [highlight.js](https://highlightjs.org/) as an example, it's likely you will include the language styles in the head section and the related javascript at the bottom of the page. You will also need a custom little piece of javascript that renders the highlight when the page is loaded.

Further more, you don't want to include all these resources in all the pages, only in the pages where you need to highlight some code.

This plugin helps to organize all these resources in a way you only need to specify the bundle you want to load in the front matter of the pages where you really need it.

## Installation

```javascript
npm install metalsmith-bundles
npm install handlebars-helper-bundles
```

## Usage

### Defining bundles

A bundle is a directory that contains three files, each of them represents a section where the resources are included.

```
├── /path/to/bundles
    ├── highlightjs
    │   ├── footer.html
    │   ├── head.html
    │   └── page.html
```

In each of the files you might want to have the inclusion of the needed resources, let's say:

```html
// head.html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.7.0/styles/monokai-sublime.min.css" />


// footer.html
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.7.0/highlight.min.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.7.0/languages/javascript.min.js"></script>

<script>

    hljs.initHighlightingOnLoad();

</script>


// page.html is empty in this case
```

### The front matter

To tell a page to use a bundle you just have to specify it in the front matter, the key is the directory name you created before.

```yaml
// post.md

---
title: A post
description: A very simple post.

bundles:
    - highlightjs
---

<h1> {{ title }} </h1>
```

### The templates

At this point you probably have a layout, let's tell Handlebars to include the needed resources. For this the plugin [handlebars-helper-bundles] is used.

```html
...
<head>
    {{ bundles 'head' }}
</head>
<body>

    {{{ contents }}}

    <footer>
        {{ bundles 'footer' }}
    </footer>

</body>
...
```

The `page` section is meant to be included at the end of the `content`, you might include it at the end of your `post` template in the same way if needed: `{{ bundles 'page' }}`.

### Using the plugin

```javascript
var handlebars = require('handlebars');
var bundles = require('metalsmith-bundles');
var hbtbundles = require('handlebars-helper-bundles')(handlebars),

new Metalsmith(__dirname)
    .use(bundles({
        directory: '/path/to/bundles'
    }))
    .build();
```

In this example only the `post.md` file will have all the resources, if you need the same in other pages you just have to specify the bundle name in the front matter.

### **`options`** `Object`

- **`directory`** `String`

    The directory where the bundles definitions are.

- **`extension`** `String`

    Optional. The extension of each of the files defining a bundle section.

## License

MIT License, see [LICENSE](https://github.com/ahdiaz/metalsmith-bundles/blob/master/LICENSE.md) for details.


[handlebars-helper-bundles]: https://github.com/ahdiaz/handlebars-helper-bundles
