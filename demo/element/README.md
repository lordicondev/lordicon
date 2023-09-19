# demo-element

List of available web examples:

- **release** - This example presents the easiest way to use the Lordicon custom
  element with released version. Keep in mind that this is not the most
  efficient method as the entire library (including bundled lottie-web) is
  loaded by default.
- **triggers** - In this example, we present all available built-in animation
  triggers.
- **trigger target** - Use the target attribute to indicate which parent element
  should activate the trigger. Helpful functionality when building all kinds of
  links, buttons, or bounding boxes where we don't want the user to have to
  mouse hover exactly at the icon to activate it.
- **customization** - This example presents all customizable attributes
  supported by element.
- **current color** - This case study presents, a class built into element:
  _current-color_. With this class, icon will inherit color from a parent.
- **css variables** - This example utilizes CSS variables to customize colors on
  supported icons (at the moment only System icons). Notice: CSS variables take
  precedence over colors assigned by other methods!
- **background** - This example presents the use of the element as a background.
- **manual control** - Example of manual interaction with icon and player.
- **icon loader** - Example of creating icon loader callback which can be used
  to provide icon data from alternate sources.
- **loading lazy** - Load icons only when needed.
- **loading lazy effect** - Load icons only when needed. Fade in icons after the
  load completes, to create a simultaneous smooth appearance.
- **loading-placeholder** - Example of showing super small SVG until custom
  element is ready.
- **loading-placeholder-interaction** - Example of showing super small SVG until
  first user interaction with element.
- **state** - This example presents usage for icons state animation. It is
  easier than ever to switch between each motion type to use them as stand-alone
  animations or combine and create an interactive experience.
- **custom trigger** - If none of the provided triggers meet what we need to
  implement, we allow building custom animation triggers. Provided example shows
  how to create trigger which will reverse animation on the second click.
- **custom trigger scroll** - This custom trigger plays an animation when a user
  scrolls the website.
- **custom trigger in screen** - This example presents how to build an animation
  trigger, which plays animation once the icon appears in the browser viewport.
- **custom trigger states** - Complex usage example of states with the custom
  trigger. Eg. see how the trash icon appears, fills, and erases as the user
  interacts.
- **lottie light** - Example of use our element with _lottie-web-light_ which is
  a way smaller in size but doesn't support expressions (and as a consequence
  dynamic customization). You can use the light version in pair with our raw
  icon data.
- **upload** - Preview uploaded file.