LIGHTSTREAMER - JAVASCRIPT CLIENT DEVELOPMENT RESOURCES
=======================================================

This directory includes the resources needed to transform any
HTML or HTML5 web application into a Client of Lightstreamer Server.
This also applies to applications written for the Node.js platform,
through the use of a subset of the library.

- Version.txt
  Reports the current SDK version and compatibility constraints.

- tools/generator.html
  A tool that allows you to generate a subset of the full library,
  which can be used for deployment in case some features are not needed
  by the application. It can be opened with any browser.
  The tool also allows you to create different versions of the library,
  which expose the interface with different syntax flavours.

- lib
  The resources to be deployed on the Web Server as part of a web
  application. The JavaScript Client Library is comprised of only one file:
    - lightstreamer.js
  This is the basic version of the library, used in all the included JavaScript
  examples; it leans on an external AMD loader. 

- alternative_libs
  Contains alternative versions of the JavaScript Client Library, suitable
  for specific cases:
    - lightstreamer_node.js
      The subset of the full library that can be deployed on Node.js as part
      of the final application.
    - lightstreamer_namespace.js
      A version of the full library that can be used when full interoperability
      with other libraries is needed and an external AMD loader is available;
      see the provided generator.html tool ("Use AMD with namespaced names"
      case) for usage examples.
    - lightstreamer_globals.js
      A version of the full library that can be used when an external AMD
      loader is not available; see the provided generator.html tool ("Use
      globals" case) for usage examples.
  All library versions can be generated using the provided generator.html tool.