/**
 * Unit tests for DeckBackgroundService
 * Tests background image listing, caching, and path validation
 */

import { DeckBackgroundService } from '../../src/services/deckBackgroundService';
import * as path from 'path';

// Mock fs/promises
const mockReaddir = jest.fn();
const mockAccess = jest.fn();

jest.mock('fs/promises', () => ({
  readdir: (...args: any[]) => mockReaddir(...args),
  access: (...args: any[]) => mockAccess(...args),
  constants: {
    F_OK: 0
  }
}));

/** Mutable fixtures for mockImplementation (two readdir calls per getAvailableBackgrounds). */
let landscapeFilesForMock: string[] = [];
let portraitFilesForMock: string[] = [];

function setupReaddirMock(): void {
  mockReaddir.mockImplementation((dirPath: string) => {
    const base = path.basename(dirPath);
    if (base === 'landscape') {
      return Promise.resolve([...landscapeFilesForMock]);
    }
    if (base === 'portrait') {
      return Promise.resolve([...portraitFilesForMock]);
    }
    return Promise.reject(new Error(`unexpected readdir path: ${dirPath}`));
  });
}

describe('DeckBackgroundService', () => {
  let service: DeckBackgroundService;

  beforeEach(() => {
    service = new DeckBackgroundService();
    jest.clearAllMocks();
    jest.useFakeTimers();
    landscapeFilesForMock = [];
    portraitFilesForMock = [];
    setupReaddirMock();
  });

  afterEach(() => {
    jest.useRealTimers();
    service.clearCache();
  });

  describe('getAvailableBackgrounds', () => {
    it('should return list of PNG files from backgrounds directory', async () => {
      landscapeFilesForMock = ['aesclepnotext.png', 'bakernotext.png', 'test.jpg', 'another.png'];
      portraitFilesForMock = [];

      const result = await service.getAvailableBackgrounds();

      expect(result.length).toBe(3); // Only PNG files
      expect(result).toContain('src/resources/images/backgrounds/landscape/another.png');
      expect(result).toContain('src/resources/images/backgrounds/landscape/aesclepnotext.png');
      expect(result).toContain('src/resources/images/backgrounds/landscape/bakernotext.png');
      expect(result).not.toContain('src/resources/images/backgrounds/landscape/test.jpg');
      expect(mockReaddir).toHaveBeenCalledTimes(2);
    });

    it('should merge PNG files from landscape and portrait', async () => {
      landscapeFilesForMock = ['land.png'];
      portraitFilesForMock = ['port.png', 'skip.jpg'];

      const result = await service.getAvailableBackgrounds();

      expect(result).toEqual([
        'src/resources/images/backgrounds/landscape/land.png',
        'src/resources/images/backgrounds/portrait/port.png'
      ]);
      expect(mockReaddir).toHaveBeenCalledTimes(2);
    });

    it('should filter out non-PNG files', async () => {
      landscapeFilesForMock = ['test.jpg', 'test.gif', 'test.webp', 'valid.png'];
      portraitFilesForMock = [];

      const result = await service.getAvailableBackgrounds();

      expect(result).toEqual(['src/resources/images/backgrounds/landscape/valid.png']);
      expect(result.length).toBe(1);
    });

    it('should handle case-insensitive PNG extension matching', async () => {
      landscapeFilesForMock = ['test.PNG', 'test.Png', 'test.png'];
      portraitFilesForMock = [];

      const result = await service.getAvailableBackgrounds();

      expect(result.length).toBe(3);
      // The implementation preserves original case in filenames
      expect(result).toContain('src/resources/images/backgrounds/landscape/test.PNG');
      expect(result).toContain('src/resources/images/backgrounds/landscape/test.Png');
      expect(result).toContain('src/resources/images/backgrounds/landscape/test.png');
    });

    it('should return sorted list of backgrounds', async () => {
      landscapeFilesForMock = ['zebra.png', 'alpha.png', 'beta.png'];
      portraitFilesForMock = [];

      const result = await service.getAvailableBackgrounds();

      expect(result).toEqual([
        'src/resources/images/backgrounds/landscape/alpha.png',
        'src/resources/images/backgrounds/landscape/beta.png',
        'src/resources/images/backgrounds/landscape/zebra.png'
      ]);
    });

    it('should return portrait paths when landscape folder read fails', async () => {
      mockReaddir.mockImplementation((dirPath: string) => {
        const base = path.basename(dirPath);
        if (base === 'landscape') {
          return Promise.reject(new Error('Permission denied'));
        }
        if (base === 'portrait') {
          return Promise.resolve(['only.png']);
        }
        return Promise.reject(new Error(`unexpected ${dirPath}`));
      });

      const result = await service.getAvailableBackgrounds();

      expect(result).toEqual(['src/resources/images/backgrounds/portrait/only.png']);
    });

    it('should cache results for 15 minutes', async () => {
      landscapeFilesForMock = ['test.png'];
      portraitFilesForMock = [];

      // First call - should read from filesystem
      const result1 = await service.getAvailableBackgrounds();
      expect(mockReaddir).toHaveBeenCalledTimes(2);

      // Advance time by 14 minutes (still within cache)
      jest.advanceTimersByTime(14 * 60 * 1000);

      // Second call - should use cache
      const result2 = await service.getAvailableBackgrounds();
      expect(mockReaddir).toHaveBeenCalledTimes(2); // Still only two readdir per load
      expect(result2).toEqual(result1);
    });

    it('should refresh cache after 15 minutes', async () => {
      landscapeFilesForMock = ['old.png'];
      portraitFilesForMock = [];

      // First call
      const result1 = await service.getAvailableBackgrounds();
      expect(result1.length).toBe(1);

      landscapeFilesForMock = ['old.png', 'new.png'];

      // Advance time by 15 minutes and 1 second (cache expired)
      jest.advanceTimersByTime(15 * 60 * 1000 + 1000);

      // Second call - should refresh cache
      const result2 = await service.getAvailableBackgrounds();
      expect(mockReaddir).toHaveBeenCalledTimes(4);
      expect(result2.length).toBe(2);
    });

    it('should return empty array when both subfolders fail to read', async () => {
      mockReaddir.mockRejectedValue(new Error('Permission denied'));

      const result = await service.getAvailableBackgrounds();

      expect(result).toEqual([]);
    });

    it('should return empty array if both directories do not exist', async () => {
      mockReaddir.mockRejectedValue({ code: 'ENOENT' });

      const result = await service.getAvailableBackgrounds();

      expect(result).toEqual([]);
    });
  });

  describe('validateBackgroundPath', () => {
    it('should return true for null path (default background)', async () => {
      const result = await service.validateBackgroundPath(null);
      expect(result).toBe(true);
    });

    it('should return true for valid background path', async () => {
      const validPath = 'src/resources/images/backgrounds/landscape/aesclepnotext.png';
      mockAccess.mockResolvedValue(undefined);

      const result = await service.validateBackgroundPath(validPath);

      expect(result).toBe(true);
      expect(mockAccess).toHaveBeenCalled();
    });

    it('should return true for valid portrait background path', async () => {
      const validPath = 'src/resources/images/backgrounds/portrait/freya.png';
      mockAccess.mockResolvedValue(undefined);

      const result = await service.validateBackgroundPath(validPath);

      expect(result).toBe(true);
      expect(mockAccess).toHaveBeenCalled();
    });

    it('should return false for path without "backgrounds" directory', async () => {
      const invalidPath = 'src/resources/cards/images/other/image.png';

      const result = await service.validateBackgroundPath(invalidPath);

      expect(result).toBe(false);
      expect(mockAccess).not.toHaveBeenCalled();
    });

    it('should return false for non-existent file', async () => {
      const invalidPath = 'src/resources/images/backgrounds/landscape/nonexistent.png';
      mockAccess.mockRejectedValue({ code: 'ENOENT' });

      const result = await service.validateBackgroundPath(invalidPath);

      expect(result).toBe(false);
    });

    it('should return false for path with access error', async () => {
      const invalidPath = 'src/resources/images/backgrounds/landscape/test.png';
      mockAccess.mockRejectedValue(new Error('Permission denied'));

      const result = await service.validateBackgroundPath(invalidPath);

      expect(result).toBe(false);
    });

    it('should handle paths with "backgrounds" in different positions', async () => {
      const validPath = 'src/resources/images/backgrounds/landscape/test.png';
      mockAccess.mockResolvedValue(undefined);

      const result = await service.validateBackgroundPath(validPath);

      expect(result).toBe(true);
    });

    it('should resolve path correctly from project root', async () => {
      const relativePath = 'src/resources/images/backgrounds/landscape/test.png';
      mockAccess.mockResolvedValue(undefined);

      await service.validateBackgroundPath(relativePath);

      // Verify access was called with a resolved path
      expect(mockAccess).toHaveBeenCalled();
      const callArgs = (mockAccess as jest.Mock).mock.calls[0][0];
      expect(callArgs).toContain('backgrounds');
      expect(callArgs).toContain('test.png');
    });
  });

  describe('clearCache', () => {
    it('should clear cached backgrounds', async () => {
      landscapeFilesForMock = ['test.png'];
      portraitFilesForMock = [];

      // Load cache
      await service.getAvailableBackgrounds();
      expect(mockReaddir).toHaveBeenCalledTimes(2);

      // Clear cache
      service.clearCache();

      // Advance time but stay within original cache window
      jest.advanceTimersByTime(5 * 60 * 1000);

      // Should read from filesystem again
      await service.getAvailableBackgrounds();
      expect(mockReaddir).toHaveBeenCalledTimes(4);
    });

    it('should reset cache timestamp', async () => {
      landscapeFilesForMock = ['test.png'];
      portraitFilesForMock = [];

      await service.getAvailableBackgrounds();
      service.clearCache();

      // Should immediately refresh on next call
      await service.getAvailableBackgrounds();
      expect(mockReaddir).toHaveBeenCalledTimes(4);
    });
  });
});
