import ExpoModulesCore

public class PopupButtonModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('PopupButton')` in JavaScript.
    Name("PopupButton")

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(PopupButtonView.self) {
      // Defines a setter for the `options` prop.
      // Accepts an array of objects with { label: string, value: any }
      Prop("options") { (view: PopupButtonView, options: [OptionItem]) in
        view.options = options
      }

      Prop("preferredMenuElementOrder") { (view: PopupButtonView, preferredMenuElementOrder: String) in
        if #available(iOS 16.0, *) {
          view.setPreferredMenuElementOrder(preferredMenuElementOrder == "fixed" ? .fixed : .automatic)
        }
      }
      
      // Defines the onOptionSelect event handler
      Events("onOptionSelect")
    }
  }
}
