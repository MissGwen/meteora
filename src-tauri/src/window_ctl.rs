#[cfg(target_os = "windows")]
use windows::Win32::UI::WindowsAndMessaging::{SetWindowPos, HWND_BOTTOM, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE};
#[cfg(target_os = "windows")]
use windows::Win32::Foundation::HWND;

/// Push the window to the bottom of the z-order so it stays on the desktop.
#[cfg(target_os = "windows")]
pub fn pin_to_bottom(hwnd_ptr: *mut core::ffi::c_void) {
    unsafe {
        let hwnd = HWND(hwnd_ptr);
        let _ = SetWindowPos(
            hwnd,
            HWND_BOTTOM,
            0,
            0,
            0,
            0,
            SWP_NOSIZE | SWP_NOMOVE | SWP_NOACTIVATE,
        );
    }
}

#[cfg(not(target_os = "windows"))]
pub fn pin_to_bottom(_hwnd_ptr: *mut core::ffi::c_void) {}
