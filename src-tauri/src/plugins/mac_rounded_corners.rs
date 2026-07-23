// Copyright 2026 UNLOOP MORGAN
// SPDX-License-Identifier: Apache-2.0

use objc::{msg_send, sel, sel_impl};

pub struct WindowStyle {
    pub corner_radius: f64,
    pub offset_x: f64,
    pub offset_y: f64,
}

/// Enable modern window style with custom corner radius on macOS.
pub fn enable_modern_window_style(window: *mut std::ffi::c_void, style: WindowStyle) {
    let ns_window: *mut objc::runtime::Object = window as *mut _;

    unsafe {
        let _: () = msg_send![ns_window, _setCornerRadius: style.corner_radius];
    }

    if style.offset_x != 0.0 || style.offset_y != 0.0 {
        unsafe {
            let button: *mut objc::runtime::Object =
                msg_send![ns_window, standardWindowButton: 0usize];
            if !button.is_null() {
                let superview: *mut objc::runtime::Object = msg_send![button, superview];
                if !superview.is_null() {
                    let _: () = msg_send![
                        superview,
                        setFrameOrigin: (style.offset_x, style.offset_y)
                    ];
                }
            }
        }
    }
}
