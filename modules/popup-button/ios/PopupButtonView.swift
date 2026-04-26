import ExpoModulesCore
import UIKit

// Struct to represent an option item with label and generic value
struct OptionItem: Convertible {
  let label: String
  let value: Any
  let disabled: Bool

  static func convert(from value: Any?, appContext: AppContext) throws -> Self {
    guard let dict = value as? [String: Any],
          let label = dict["label"] as? String else {
      throw Conversions.ConvertingException<OptionItem>(value)
    }
    let disabled = dict["disabled"] as? Bool ?? false
    return OptionItem(
      label: label,
      value: dict["value"] ?? NSNull(),
      disabled: disabled
    )
  }
}

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class PopupButtonView: ExpoView {
  let button = UIButton(type: .system)
  var options: [OptionItem] = [] {
    didSet {
      updateMenu()
    }
  }
  var selectedValue: Any? {
    didSet {
      updateMenu()
    }
  }
  let onOptionSelect = EventDispatcher()
  
  @available(iOS 16.0, *)
  func setPreferredMenuElementOrder(_ order: UIContextMenuConfiguration.ElementOrder) {
    button.preferredMenuElementOrder = order
    button.layoutIfNeeded()
  }
  
  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true

    // Configure button as a popup button (shows menu on tap)
    button.showsMenuAsPrimaryAction = true
    
    addSubview(button)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    button.frame = bounds
    
    // Layout children (if any) to fill the button area
    // Children are automatically added as subviews by ExpoView
    // Make children non-interactive
    // so they don't block button taps
    // let hasChildren = subviews.contains { $0 != button }
    for subview in subviews where subview != button {
      subview.isUserInteractionEnabled = false
    }
  }

  private func updateMenu() {
    guard !options.isEmpty else {
      button.menu = nil
      return
    }

    let menuActions = options.map { option -> UIAction in
      let attributes: UIAction.Attributes = option.disabled ? .disabled : []
      let state: UIAction.State = isSelected(option) ? .on : .off
      return UIAction(title: option.label, attributes: attributes, state: state) { [weak self] _ in
        self?.onOptionSelect([
          "label": option.label,
          "value": option.value
        ])
      }
    }

    button.menu = UIMenu(children: menuActions)
    button.layoutIfNeeded()
  }
  
  private func isSelected(_ option: OptionItem) -> Bool {
    guard let selectedValue = selectedValue, !(selectedValue is NSNull) else {
      return false
    }

    return areEqual(option.value, selectedValue)
  }

  private func areEqual(_ lhs: Any, _ rhs: Any) -> Bool {
    if lhs is NSNull && rhs is NSNull {
      return true
    }
    
    if let lhsObj = lhs as? NSObject, let rhsObj = rhs as? NSObject {
      return lhsObj.isEqual(rhsObj)
    }
    
    return lhs as AnyObject === rhs as AnyObject
  }
}