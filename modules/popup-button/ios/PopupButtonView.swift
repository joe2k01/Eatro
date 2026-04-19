import ExpoModulesCore
import UIKit

// Struct to represent an option item with label and generic value
struct OptionItem: Convertible {
  let label: String
  let value: Any
  let disabled: Bool
  let persistSelection: Bool

  static func convert(from value: Any?, appContext: AppContext) throws -> Self {
    guard let dict = value as? [String: Any],
          let label = dict["label"] as? String else {
      throw Conversions.ConvertingException<OptionItem>(value)
    }
    let disabled = dict["disabled"] as? Bool ?? false
    let persistSelection = dict["persistSelection"] as? Bool ?? true
    return OptionItem(
      label: label,
      value: dict["value"] ?? NSNull(),
      disabled: disabled,
      persistSelection: persistSelection
    )
  }
}

// This view will be used as a native component. Make sure to inherit from `ExpoView`
// to apply the proper styling (e.g. border radius and shadows).
class PopupButtonView: ExpoView {
  let button = UIButton(type: .system)
  var options: [OptionItem] = [] {
    didSet {
      createMenu()
    }
  }
  /// When true, `createMenu` uses `menuSelectionValue` for the checkmark instead of `selectedOption`.
  var usesExplicitMenuSelection: Bool = false {
    didSet {
      createMenu()
    }
  }
  /// Which option.value should show the checkmark; `nil` / `NSNull` = none (explicit mode only).
  var menuSelectionValue: Any? {
    didSet {
      createMenu()
    }
  }
  var selectedIndex: Int?
  var selectedOption: OptionItem?
  var menuActions: [UIAction] = []
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

  private func createMenu() {
    guard !options.isEmpty else {
      button.menu = nil
      menuActions = []
      selectedIndex = nil
      selectedOption = nil
      return
    }

    menuActions = options.enumerated().map { index, option -> UIAction in
      let attributes: UIAction.Attributes = option.disabled ? .disabled : []
      return UIAction(title: option.label, attributes: attributes) { [weak self] _ in
        guard let self = self else { return }
        if option.persistSelection {
          self.selectOption(at: index, shouldDispatch: true)
        } else {
          self.onOptionSelect([
            "label": option.label,
            "value": option.value
          ])
        }
      }
    }

    let resolvedIndex: Int?
    if usesExplicitMenuSelection {
      if menuSelectionValue == nil || menuSelectionValue is NSNull {
        resolvedIndex = nil
      } else {
        resolvedIndex = options.firstIndex { areEqual($0.value, menuSelectionValue!) }
      }
    } else if let selectedOption = selectedOption {
      resolvedIndex = options.firstIndex {
        $0.label == selectedOption.label && areEqual($0.value, selectedOption.value)
      }
    } else {
      resolvedIndex = nil
    }

    if let idx = resolvedIndex {
      selectOption(at: idx, shouldDispatch: false)
    } else if usesExplicitMenuSelection {
      clearMenuSelection()
    } else {
      selectOption(at: 0, shouldDispatch: false)
    }
  }

  private func clearMenuSelection() {
    selectedIndex = nil
    selectedOption = nil
    for i in 0..<menuActions.count {
      menuActions[i].state = .off
    }
    button.menu = UIMenu(children: menuActions)
    button.layoutIfNeeded()
  }

  private func selectOption(at index: Int, shouldDispatch: Bool = true) {
    guard index < options.count else { return }
    
    let previousIndex = selectedIndex

    let option = options[index]
    selectedIndex = index
    selectedOption = option
    
    if let previousIndex = previousIndex, previousIndex < menuActions.count {
      menuActions[previousIndex].state = .off
    }

    if index < menuActions.count {
      menuActions[index].state = .on
    }

    button.menu = UIMenu(children: menuActions)
    button.layoutIfNeeded()

    // Dispatch event if needed
    if shouldDispatch {
      onOptionSelect([
        "label": option.label,
        "value": option.value
      ])
    }
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