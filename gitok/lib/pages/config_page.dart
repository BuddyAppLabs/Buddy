/// 设置页面
///
/// 提供应用的各项设置选项，包括：
/// - 快捷键设置
/// - 其他全局设置
library;

import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gitok/widgets/recorder.dart';
import 'package:hotkey_manager/hotkey_manager.dart';
import 'package:preference_list/preference_list.dart';
import 'package:window_manager/window_manager.dart';

class ExampleIntent extends Intent {}

class ExampleAction extends Action<ExampleIntent> {
  @override
  void invoke(covariant ExampleIntent intent) {
    BotToast.showText(text: 'ExampleAction invoked');
  }
}

class ConfigPage extends StatefulWidget {
  final bool isEmbedded; // 是否作为嵌入组件使用

  const ConfigPage({
    super.key,
    this.isEmbedded = false, // 默认为独立页面模式
  });

  @override
  State<ConfigPage> createState() => _ConfigPageState();
}

class _ConfigPageState extends State<ConfigPage> with WindowListener {
  // 修改为单个热键而不是列表
  HotKey? _currentHotKey;
  DateTime? _lastCommandKeyPress;

  @override
  void initState() {
    super.initState();
    _loadCurrentHotKey();
  }

  Future<void> _loadCurrentHotKey() async {
    // 从已注册的热键列表中获取第一个（如果有的话）
    final hotkeys = hotKeyManager.registeredHotKeyList;
    if (hotkeys.isNotEmpty) {
      setState(() => _currentHotKey = hotkeys.first);
    }
  }

  Future<void> _handleHotKeyRegister(HotKey hotKey) async {
    // 如果已经有热键，先注销它
    if (_currentHotKey != null) {
      await hotKeyManager.unregister(_currentHotKey!);
    }

    // 注册新的热键
    await hotKeyManager.register(
      hotKey,
      keyDownHandler: (hotKey) async {
        await windowManager.show();
        await windowManager.focus();
      },
    );

    setState(() => _currentHotKey = hotKey);
    BotToast.showText(text: '快捷键设置成功：${_formatHotKey(hotKey)}');
  }

  Widget _buildBody(BuildContext context) {
    return PreferenceList(
      children: <Widget>[
        PreferenceListSection(
          title: const Text('全局快捷键设置'),
          children: [
            if (_currentHotKey != null)
              PreferenceListItem(
                padding: const EdgeInsets.all(12),
                title: Row(
                  children: [
                    HotKeyVirtualView(hotKey: _currentHotKey!),
                    const SizedBox(width: 10),
                    const Text(
                      '将应用带到前台',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
                accessoryView: SizedBox(
                  width: 40,
                  height: 40,
                  child: CupertinoButton(
                    padding: EdgeInsets.zero,
                    child: const Stack(
                      alignment: Alignment.center,
                      children: [
                        Icon(
                          CupertinoIcons.delete,
                          size: 18,
                          color: Colors.red,
                        ),
                      ],
                    ),
                    onPressed: () async {
                      await hotKeyManager.unregister(_currentHotKey!);
                      setState(() => _currentHotKey = null);
                      BotToast.showText(text: '快捷键已删除');
                    },
                  ),
                ),
              ),
            PreferenceListItem(
              title: Text(
                _currentHotKey == null ? '设置快捷键' : '修改快捷键',
                style: TextStyle(
                  color: Theme.of(context).primaryColor,
                ),
              ),
              accessoryView: Container(),
              onTap: _handleClickRegisterNewHotKey,
            ),
          ],
        ),
        PreferenceListSection(
          title: const Text('快捷键预设'),
          children: [
            PreferenceListItem(
              title: const Text('Alt + 1'),
              onTap: () => _setupHotkey(HotKey(
                key: LogicalKeyboardKey.digit1,
                modifiers: [HotKeyModifier.alt],
                scope: HotKeyScope.system,
              )),
            ),
            PreferenceListItem(
              title: const Text('Ctrl + Space'),
              onTap: () => _setupHotkey(HotKey(
                key: LogicalKeyboardKey.space,
                modifiers: [HotKeyModifier.control],
                scope: HotKeyScope.system,
              )),
            ),
            PreferenceListItem(
              title: const Text('⌘ + G'),
              onTap: () => _setupHotkey(HotKey(
                key: LogicalKeyboardKey.keyG,
                modifiers: [HotKeyModifier.meta],
                scope: HotKeyScope.system,
              )),
            ),
            PreferenceListItem(
              title: const Text('双击 ⌘'),
              onTap: _setupDoubleCommandHotkey,
            ),
          ],
        ),
      ],
    );
  }

  String _formatHotKey(HotKey hotKey) {
    final List<String> parts = [];

    if (hotKey.modifiers?.contains(HotKeyModifier.alt) ?? false) {
      parts.add('Alt');
    }
    if (hotKey.modifiers?.contains(HotKeyModifier.control) ?? false) {
      parts.add('Ctrl');
    }
    if (hotKey.modifiers?.contains(HotKeyModifier.meta) ?? false) {
      parts.add('⌘');
    }
    if (hotKey.modifiers?.contains(HotKeyModifier.shift) ?? false) {
      parts.add('Shift');
    }

    parts.add(hotKey.key.keyLabel);

    return parts.join(' + ');
  }

  Future<void> _handleClickRegisterNewHotKey() async {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return RecordHotKeyDialog(
          onHotKeyRecorded: (newHotKey) => _handleHotKeyRegister(newHotKey),
        );
      },
    );
  }

  Future<void> _setupHotkey(HotKey hotKey) async {
    try {
      if (_currentHotKey != null) {
        await hotKeyManager.unregister(_currentHotKey!);
      }
      await hotKeyManager.register(
        hotKey,
        keyDownHandler: (hotKey) async {
          await windowManager.show();
          await windowManager.focus();
        },
      );
      setState(() => _currentHotKey = hotKey);
      BotToast.showText(text: '快捷键设置成功！🎉');
    } catch (e) {
      BotToast.showText(text: '设置失败：$e 😅');
    }
  }

  Future<void> _setupDoubleCommandHotkey() async {
    try {
      if (_currentHotKey != null) {
        await hotKeyManager.unregister(_currentHotKey!);
      }
      final hotKey = HotKey(
        key: LogicalKeyboardKey.metaLeft,
        modifiers: [], // 明确设置为空数组
        scope: HotKeyScope.system,
      );

      // 先注册热键
      await hotKeyManager.register(
        hotKey,
        keyDownHandler: (hotKey) {
          final now = DateTime.now();
          if (_lastCommandKeyPress != null &&
              now.difference(_lastCommandKeyPress!) <= const Duration(milliseconds: 500)) {
            // 使用 Future.microtask 来避免在回调中直接调用异步方法
            Future.microtask(() async {
              await windowManager.show();
              await windowManager.focus();
            });
            _lastCommandKeyPress = null;
          } else {
            _lastCommandKeyPress = now;
          }
        },
      );

      setState(() => _currentHotKey = hotKey);
      BotToast.showText(text: '双击 Command 快捷键设置成功！✨');
    } catch (e) {
      BotToast.showText(text: '设置失败：$e 😅');
    }
  }

  Widget _build(BuildContext context) {
    return widget.isEmbedded
        ? _buildBody(context) // 嵌入模式下只返回内容部分
        : Scaffold(
            appBar: AppBar(
              title: const Text('设置'),
            ),
            body: Column(
              children: [
                Expanded(
                  child: _buildBody(context),
                ),
              ],
            ),
          );
  }

  @override
  Widget build(BuildContext context) {
    return Actions(
      actions: <Type, Action<Intent>>{
        ExampleIntent: ExampleAction(),
      },
      child: GlobalShortcuts(
        shortcuts: {
          const SingleActivator(LogicalKeyboardKey.keyA, alt: true): ExampleIntent(),
        },
        child: _build(context),
      ),
    );
  }
}
